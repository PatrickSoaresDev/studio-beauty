type QueueRunner = <T>(task: () => Promise<T>) => Promise<T>;

function makeQueue(): QueueRunner {
  let tail: Promise<unknown> = Promise.resolve();
  return function run<T>(task: () => Promise<T>): Promise<T> {
    const next = tail.then(() => task());
    tail = next.catch(() => {});
    return next;
  };
}

const byDateKey = new Map<string, QueueRunner>();

export function runBookingForDateKey<T>(dateKey: string, task: () => Promise<T>): Promise<T> {
  let q = byDateKey.get(dateKey);
  if (!q) {
    q = makeQueue();
    byDateKey.set(dateKey, q);
  }
  return q(task);
}
