import { openDB, type DBSchema, type IDBPDatabase } from 'idb'
import type { Plan, SessionRun, UserProfile } from '../domain'

interface YourWorkoutDB extends DBSchema {
  profiles: { key: string; value: UserProfile }
  plans: { key: string; value: Plan; indexes: { generatedAt: string } }
  runs: { key: string; value: SessionRun; indexes: { sessionId: string; lastActiveAt: string } }
  meta: { key: string; value: { key: string; value: string } }
}

const DB_NAME = 'your-workout'
const DB_VERSION = 1
let instance: IDBPDatabase<YourWorkoutDB> | undefined

export async function getDatabase() {
  if (instance) return instance
  instance = await openDB<YourWorkoutDB>(DB_NAME, DB_VERSION, {
    upgrade(db) {
      if (!db.objectStoreNames.contains('profiles')) db.createObjectStore('profiles', { keyPath: 'id' })
      if (!db.objectStoreNames.contains('plans')) {
        const store = db.createObjectStore('plans', { keyPath: 'id' })
        store.createIndex('generatedAt', 'generatedAt')
      }
      if (!db.objectStoreNames.contains('runs')) {
        const store = db.createObjectStore('runs', { keyPath: 'id' })
        store.createIndex('sessionId', 'sessionId')
        store.createIndex('lastActiveAt', 'lastActiveAt')
      }
      if (!db.objectStoreNames.contains('meta')) db.createObjectStore('meta', { keyPath: 'key' })
    },
    blocked() {
      window.dispatchEvent(new CustomEvent('your-workout:storage-blocked'))
    },
  })
  return instance
}

export async function loadLatestProfile() {
  const values = await (await getDatabase()).getAll('profiles')
  return values.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))[0]
}

export async function saveProfile(profile: UserProfile) {
  await (await getDatabase()).put('profiles', profile)
}

export async function loadLatestPlan() {
  const values = await (await getDatabase()).getAllFromIndex('plans', 'generatedAt')
  return values.at(-1)
}

export async function savePlan(plan: Plan) {
  await (await getDatabase()).put('plans', plan)
}

export async function loadRuns() {
  return (await getDatabase()).getAllFromIndex('runs', 'lastActiveAt')
}

export async function saveRun(run: SessionRun) {
  await (await getDatabase()).put('runs', run)
}

export async function eraseAllData() {
  const db = await getDatabase()
  const transaction = db.transaction(['profiles', 'plans', 'runs', 'meta'], 'readwrite')
  await Promise.all([
    transaction.objectStore('profiles').clear(), transaction.objectStore('plans').clear(),
    transaction.objectStore('runs').clear(), transaction.objectStore('meta').clear(), transaction.done,
  ])
  localStorage.removeItem('your-workout:schema')
}
