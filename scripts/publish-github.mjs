import fs from 'node:fs/promises';
import path from 'node:path';

const [repository, ...files] = process.argv.slice(2);
const token = (await fs.readFile('.gh-token', 'utf8')).trim();

if (!repository || files.length === 0) {
  throw new Error('Usage: node scripts/publish-github.mjs owner/repo <files...>');
}

async function github(endpoint, options = {}) {
  const response = await fetch(`https://api.github.com${endpoint}`, {
    ...options,
    headers: {
      Accept: 'application/vnd.github+json',
      Authorization: `Bearer ${token}`,
      'X-GitHub-Api-Version': '2022-11-28',
      ...options.headers
    }
  });
  if (!response.ok) {
    throw new Error(`${response.status} ${endpoint}: ${await response.text()}`);
  }
  return response.status === 204 ? null : response.json();
}

const refResponse = await fetch(`https://api.github.com/repos/${repository}/git/ref/heads/main`, {
  headers: {
    Accept: 'application/vnd.github+json',
    Authorization: `Bearer ${token}`,
    'X-GitHub-Api-Version': '2022-11-28'
  }
});

let parentSha = null;
let baseTree = null;
if (refResponse.ok) {
  const ref = await refResponse.json();
  parentSha = ref.object.sha;
  const commit = await github(`/repos/${repository}/git/commits/${parentSha}`);
  baseTree = commit.tree.sha;
} else if (refResponse.status !== 404 && refResponse.status !== 409) {
  throw new Error(`${refResponse.status}: ${await refResponse.text()}`);
}

if (!parentSha) {
  const bootstrapFile = files[0];
  const bootstrapContent = await fs.readFile(bootstrapFile);
  await github(`/repos/${repository}/contents/${bootstrapFile.split(path.sep).map(encodeURIComponent).join('/')}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      message: 'Initialize Lydia Workbench',
      content: bootstrapContent.toString('base64'),
      branch: 'main'
    })
  });
  const ref = await github(`/repos/${repository}/git/ref/heads/main`);
  parentSha = ref.object.sha;
  const commit = await github(`/repos/${repository}/git/commits/${parentSha}`);
  baseTree = commit.tree.sha;
}

const tree = [];
for (const filename of files) {
  const content = await fs.readFile(filename);
  const blob = await github(`/repos/${repository}/git/blobs`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ content: content.toString('base64'), encoding: 'base64' })
  });
  tree.push({ path: filename.split(path.sep).join('/'), mode: '100644', type: 'blob', sha: blob.sha });
}

const createdTree = await github(`/repos/${repository}/git/trees`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ ...(baseTree ? { base_tree: baseTree } : {}), tree })
});
const commit = await github(`/repos/${repository}/git/commits`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    message: 'Deploy Lydia Workbench',
    tree: createdTree.sha,
    parents: [parentSha]
  })
});

await github(`/repos/${repository}/git/refs/heads/main`, {
  method: 'PATCH',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ sha: commit.sha, force: false })
});

console.log(`PUBLISHED ${repository} ${commit.sha}`);
