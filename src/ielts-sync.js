const unique = (...lists) => [...new Set(lists.flat().filter(Boolean))];

const object = value => value && typeof value === 'object' && !Array.isArray(value) ? value : {};

export function mergeIeltsState(field, localValue, remoteValue) {
  if (field === 'ielts_context_offset') {
    return Math.max(Number(localValue) || 0, Number(remoteValue) || 0);
  }

  const local = object(localValue);
  const remote = object(remoteValue);
  if (field === 'ielts_catalog_progress') {
    const merged = { ...remote };
    for (const [id, entry] of Object.entries(local)) {
      if (!merged[id] || String(entry?.updatedAt || '') > String(merged[id]?.updatedAt || '')) {
        merged[id] = entry;
      }
    }
    return merged;
  }

  const minutesByDay = { ...object(remote.minutesByDay) };
  for (const [day, minutes] of Object.entries(object(local.minutesByDay))) {
    minutesByDay[day] = Math.max(Number(minutes) || 0, Number(minutesByDay[day]) || 0);
  }

  const checkins = { ...object(remote.checkins) };
  for (const [day, subjects] of Object.entries(object(local.checkins))) {
    checkins[day] = unique(checkins[day] || [], subjects || []);
  }

  const taskOffsets = { ...object(remote.taskOffsets) };
  for (const [subject, offset] of Object.entries(object(local.taskOffsets))) {
    taskOffsets[subject] = Math.max(Number(offset) || 0, Number(taskOffsets[subject]) || 0);
  }

  return {
    ...remote,
    ...local,
    minutesByDay,
    checkins,
    taskOffsets,
    vocabIndex: Math.max(Number(local.vocabIndex) || 0, Number(remote.vocabIndex) || 0),
    knownWords: unique(remote.knownWords || [], local.knownWords || []),
    reviewWords: unique(remote.reviewWords || [], local.reviewWords || []),
    reviewCursor: Math.max(Number(local.reviewCursor) || 0, Number(remote.reviewCursor) || 0)
  };
}
