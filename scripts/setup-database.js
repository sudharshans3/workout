// MongoDB Database Setup Script
// Run this to create indexes and initial setup

import { MongoClient } from "mongodb"
import bcrypt from "bcryptjs"

const uri = process.env.MONGODB_URI || "mongodb://localhost:27017"
const dbName = process.env.MONGODB_DB || "artvault"

async function setupDatabase() {
  const client = new MongoClient(uri)

  try {
    await client.connect()
    console.log("✅ Connected to MongoDB")

    const db = client.db(dbName)

    // Setup artwork collection
    const artworkCollection = db.collection("artwork")

    console.log("🔧 Creating artwork collection indexes...")
    await artworkCollection.createIndex({ createdAt: -1 })
    await artworkCollection.createIndex({ averageRating: -1 })
    await artworkCollection.createIndex({ creatorId: 1 })
    await artworkCollection.createIndex({ "ratings.sessionId": 1 })
    await artworkCollection.createIndex({ title: "text", description: "text" })

    console.log("✅ Artwork collection indexes created successfully")

    // Setup user collection
    const userCollection = db.collection("users")

    console.log("🔧 Creating user collection indexes...")
    await userCollection.createIndex({ email: 1 }, { unique: true })
    await userCollection.createIndex({ username: 1 }, { unique: true })
    await userCollection.createIndex({ createdAt: -1 })

    console.log("✅ User collection indexes created successfully")

    // Create demo users if none exist
    const userCount = await userCollection.countDocuments()
    if (userCount === 0) {
      console.log("👤 Creating demo users...")

      const demoUsers = [
        {
          email: "demo@example.com",
          username: "demo_artist",
          password: await bcrypt.hash("password123", 12),
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          email: "artist@example.com",
          username: "creative_artist",
          password: await bcrypt.hash("artist123", 12),
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          email: "painter@example.com",
          username: "digital_painter",
          password: await bcrypt.hash("paint123", 12),
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ]

      const insertedUsers = await userCollection.insertMany(demoUsers)
      console.log("✅ Demo users created:")
      console.log("   📧 demo@example.com / password123")
      console.log("   📧 artist@example.com / artist123")
      console.log("   📧 painter@example.com / paint123")

      // Get user IDs for sample artwork
      const userIds = Object.values(insertedUsers.insertedIds)

      // Insert sample artwork with real user IDs
      const artworkCount = await artworkCollection.countDocuments()
      if (artworkCount === 0) {
        console.log("🎨 Creating sample artwork...")

        const sampleArtwork = [
          {
            title: "Digital Sunset Landscape",
            description:
              "A breathtaking digital painting of a sunset over rolling mountains, featuring vibrant orange and purple hues that blend seamlessly across the sky. This piece captures the serene beauty of nature's daily spectacle.",
            imageUrl: "/placeholder.svg?height=500&width=800&text=Digital+Sunset+Landscape",
            creatorId: userIds[0].toString(),
            ratings: [
              { sessionId: "sample1", rating: 5 },
              { sessionId: "sample2", rating: 4 },
              { sessionId: "sample3", rating: 5 },
              { sessionId: "sample4", rating: 4 },
            ],
            averageRating: 4.5,
            totalRatings: 4,
            createdAt: new Date(),
            updatedAt: new Date(),
          },
          {
            title: "Abstract Geometric Harmony",
            description:
              "An exploration of geometric forms and bold colors, representing the intersection of mathematics and art. This piece uses sharp angles and contrasting colors to create visual tension and balance.",
            imageUrl: "/placeholder.svg?height=600&width=600&text=Abstract+Geometry",
            creatorId: userIds[1].toString(),
            ratings: [
              { sessionId: "sample5", rating: 4 },
              { sessionId: "sample6", rating: 3 },
              { sessionId: "sample7", rating: 5 },
            ],
            averageRating: 4.0,
            totalRatings: 3,
            createdAt: new Date(Date.now() - 86400000), // 1 day ago
            updatedAt: new Date(Date.now() - 86400000),
          },
          {
            title: "Serene Ocean Waves",
            description:
              "A realistic seascape capturing the movement and power of ocean waves. The piece showcases the artist's mastery of water dynamics and light reflection, creating a sense of calm and motion.",
            imageUrl: "/placeholder.svg?height=400&width=700&text=Ocean+Waves",
            creatorId: userIds[0].toString(),
            ratings: [
              { sessionId: "sample8", rating: 5 },
              { sessionId: "sample9", rating: 5 },
              { sessionId: "sample10", rating: 4 },
              { sessionId: "sample11", rating: 5 },
              { sessionId: "sample12", rating: 4 },
            ],
            averageRating: 4.6,
            totalRatings: 5,
            createdAt: new Date(Date.now() - 172800000), // 2 days ago
            updatedAt: new Date(Date.now() - 172800000),
          },
          {
            title: "Urban Night Lights",
            description:
              "A vibrant cityscape at night, showcasing the energy and life of urban environments. Neon lights reflect off wet streets, creating a moody and atmospheric piece.",
            imageUrl: "/placeholder.svg?height=450&width=800&text=Urban+Night+Lights",
            creatorId: userIds[2].toString(),
            ratings: [
              { sessionId: "sample13", rating: 4 },
              { sessionId: "sample14", rating: 5 },
              { sessionId: "sample15", rating: 4 },
            ],
            averageRating: 4.3,
            totalRatings: 3,
            createdAt: new Date(Date.now() - 259200000), // 3 days ago
            updatedAt: new Date(Date.now() - 259200000),
          },
          {
            title: "Mystical Forest Path",
            description:
              "A enchanting forest scene with dappled sunlight filtering through ancient trees. The winding path invites viewers to explore the mysterious depths of this magical woodland.",
            imageUrl: "/placeholder.svg?height=600&width=500&text=Mystical+Forest",
            creatorId: userIds[1].toString(),
            ratings: [
              { sessionId: "sample16", rating: 5 },
              { sessionId: "sample17", rating: 5 },
              { sessionId: "sample18", rating: 4 },
              { sessionId: "sample19", rating: 5 },
              { sessionId: "sample20", rating: 5 },
              { sessionId: "sample21", rating: 4 },
            ],
            averageRating: 4.7,
            totalRatings: 6,
            createdAt: new Date(Date.now() - 345600000), // 4 days ago
            updatedAt: new Date(Date.now() - 345600000),
          },
          {
            title: "Cosmic Nebula Dreams",
            description:
              "A stunning space artwork depicting a colorful nebula with swirling gases and distant stars. This piece captures the wonder and vastness of the cosmos.",
            imageUrl: "/placeholder.svg?height=550&width=750&text=Cosmic+Nebula",
            creatorId: userIds[2].toString(),
            ratings: [
              { sessionId: "sample22", rating: 5 },
              { sessionId: "sample23", rating: 4 },
            ],
            averageRating: 4.5,
            totalRatings: 2,
            createdAt: new Date(Date.now() - 432000000), // 5 days ago
            updatedAt: new Date(Date.now() - 432000000),
          },
        ]

        await artworkCollection.insertMany(sampleArtwork)
        console.log("✅ Sample artwork inserted successfully")
      }
    } else {
      console.log("👤 Users already exist, skipping user creation")
    }

    // Create additional collections for future features
    console.log("🔧 Setting up additional collections...")

    // Comments collection (for future use)
    const commentsCollection = db.collection("comments")
    await commentsCollection.createIndex({ artworkId: 1 })
    await commentsCollection.createIndex({ userId: 1 })
    await commentsCollection.createIndex({ createdAt: -1 })

    // Favorites collection (for future use)
    const favoritesCollection = db.collection("favorites")
    await favoritesCollection.createIndex({ userId: 1, artworkId: 1 }, { unique: true })
    await favoritesCollection.createIndex({ userId: 1 })
    await favoritesCollection.createIndex({ artworkId: 1 })

    console.log("✅ Additional collections set up successfully")

    // Display database statistics
    console.log("\n📊 Database Statistics:")
    console.log(`   Users: ${await userCollection.countDocuments()}`)
    console.log(`   Artwork: ${await artworkCollection.countDocuments()}`)
    console.log(`   Comments: ${await commentsCollection.countDocuments()}`)
    console.log(`   Favorites: ${await favoritesCollection.countDocuments()}`)

    console.log("\n🎉 Database setup completed successfully!")
    console.log("\n🚀 You can now start the application with: npm run dev")
  } catch (error) {
    console.error("❌ Database setup failed:", error)
    process.exit(1)
  } finally {
    await client.close()
    console.log("🔌 Database connection closed")
  }
}

// Run the setup
setupDatabase().catch(console.error)
