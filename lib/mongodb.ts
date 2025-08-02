import { MongoClient, type Db, ObjectId } from "mongodb"
import bcrypt from "bcryptjs"

const uri = process.env.MONGODB_URI || "mongodb://localhost:27017"
const dbName = process.env.MONGODB_DB || "artvault"

let client: MongoClient
let db: Db

export async function connectToDatabase() {
  if (!client) {
    client = new MongoClient(uri)
    await client.connect()
    db = client.db(dbName)
  }
  return { client, db }
}

export interface Artwork {
  _id?: ObjectId
  title: string
  description: string
  imageUrl: string
  creatorId: string
  ratings: { sessionId: string; rating: number }[]
  averageRating: number
  totalRatings: number
  createdAt: Date
  updatedAt: Date
}

// Update the createArtwork function to use userId instead of creatorId
export async function createArtwork(
  artworkData: Omit<
    Artwork,
    "_id" | "ratings" | "averageRating" | "totalRatings" | "createdAt" | "updatedAt" | "creatorId"
  > & { userId: string },
) {
  const { db } = await connectToDatabase()
  const artwork: Omit<Artwork, "_id"> = {
    title: artworkData.title,
    description: artworkData.description,
    imageUrl: artworkData.imageUrl,
    creatorId: artworkData.userId, // Map userId to creatorId for backward compatibility
    ratings: [],
    averageRating: 0,
    totalRatings: 0,
    createdAt: new Date(),
    updatedAt: new Date(),
  }

  const result = await db.collection("artwork").insertOne(artwork)
  return { ...artwork, _id: result.insertedId }
}

export async function getAllArtwork() {
  const { db } = await connectToDatabase()
  const artwork = await db.collection("artwork").find({}).sort({ createdAt: -1 }).toArray()

  return artwork.map((art) => ({
    ...art,
    _id: art._id.toString(),
  }))
}

export async function getArtwork(id: string) {
  const { db } = await connectToDatabase()

  if (!ObjectId.isValid(id)) {
    return null
  }

  const artwork = await db.collection("artwork").findOne({ _id: new ObjectId(id) })

  if (!artwork) {
    return null
  }

  return {
    ...artwork,
    _id: artwork._id.toString(),
  }
}

export async function updateArtwork(id: string, updateData: Partial<Artwork>) {
  const { db } = await connectToDatabase()

  if (!ObjectId.isValid(id)) {
    return null
  }

  const result = await db.collection("artwork").findOneAndUpdate(
    { _id: new ObjectId(id) },
    {
      $set: {
        ...updateData,
        updatedAt: new Date(),
      },
    },
    { returnDocument: "after" },
  )

  if (!result) {
    return null
  }

  return {
    ...result,
    _id: result._id.toString(),
  }
}

export async function deleteArtwork(id: string) {
  const { db } = await connectToDatabase()

  if (!ObjectId.isValid(id)) {
    return null
  }

  const result = await db.collection("artwork").deleteOne({ _id: new ObjectId(id) })
  return result.deletedCount > 0
}

export async function rateArtwork(id: string, rating: number, sessionId: string) {
  const { db } = await connectToDatabase()

  if (!ObjectId.isValid(id)) {
    return null
  }

  // Check if session has already rated this artwork
  const existingArtwork = await db.collection("artwork").findOne({
    _id: new ObjectId(id),
    "ratings.sessionId": sessionId,
  })

  if (existingArtwork) {
    throw new Error("Already rated")
  }

  // Add the rating
  const result = await db.collection("artwork").findOneAndUpdate(
    { _id: new ObjectId(id) },
    {
      $push: { ratings: { sessionId, rating } },
      $inc: { totalRatings: 1 },
    },
    { returnDocument: "after" },
  )

  if (!result) {
    return null
  }

  // Calculate new average rating
  const totalRating = result.ratings.reduce((sum: number, r: any) => sum + r.rating, 0)
  const averageRating = totalRating / result.ratings.length

  // Update average rating
  const finalResult = await db.collection("artwork").findOneAndUpdate(
    { _id: new ObjectId(id) },
    {
      $set: {
        averageRating: Math.round(averageRating * 10) / 10,
        updatedAt: new Date(),
      },
    },
    { returnDocument: "after" },
  )

  return {
    ...finalResult,
    _id: finalResult._id.toString(),
  }
}

export interface User {
  _id?: ObjectId
  email: string
  username: string
  password: string
  createdAt: Date
  updatedAt: Date
}

export async function createUser(userData: Omit<User, "_id" | "createdAt" | "updatedAt">) {
  const { db } = await connectToDatabase()

  const hashedPassword = await bcrypt.hash(userData.password, 12)

  const user: Omit<User, "_id"> = {
    ...userData,
    password: hashedPassword,
    createdAt: new Date(),
    updatedAt: new Date(),
  }

  const result = await db.collection("users").insertOne(user)
  return { ...user, _id: result.insertedId }
}

export async function getUserByEmail(email: string) {
  const { db } = await connectToDatabase()
  return await db.collection("users").findOne({ email })
}

export async function getUserByUsername(username: string) {
  const { db } = await connectToDatabase()
  return await db.collection("users").findOne({ username })
}

export async function getUserById(id: string) {
  const { db } = await connectToDatabase()

  if (!ObjectId.isValid(id)) {
    return null
  }

  return await db.collection("users").findOne({ _id: new ObjectId(id) })
}

export async function verifyPassword(password: string, hashedPassword: string) {
  return await bcrypt.compare(password, hashedPassword)
}
