import dotenv from "dotenv";
dotenv.config();

import { connectDB } from "../config/db";
import { User } from "../models/User";
import { Spot } from "../models/Spot";
import { hashPassword } from "../utils/hash";
import { ObjectId } from "mongodb";

const run = async () => {
  const db = await connectDB();
  const users = db.collection<User>("users");
  const spots = db.collection<Spot>("spots");

  console.log("Clearing existing spots and demo accounts...");
  await spots.deleteMany({});
  await users.deleteMany({
    email: { $in: ["admin@hiddenspot.com", "demo@hiddenspot.com"] },
  });

  console.log("Creating demo accounts...");
  const adminPassword = await hashPassword("admin123");
  const demoPassword = await hashPassword("demo123");

  const adminResult = await users.insertOne({
    name: "Admin User",
    email: "admin@hiddenspot.com",
    password: adminPassword,
    role: "admin",
    createdAt: new Date(),
  });

  const demoResult = await users.insertOne({
    name: "Demo Explorer",
    email: "demo@hiddenspot.com",
    password: demoPassword,
    role: "user",
    createdAt: new Date(),
  });

  const adminId: ObjectId = adminResult.insertedId;
  const demoId: ObjectId = demoResult.insertedId;

  console.log("Seeding hidden spots around Dhaka...");

  const spotData: Omit<Spot, "_id">[] = [
    {
      title: "Lalbagh Fort",
      shortDescription: "17th-century Mughal fort complex in Old Dhaka",
      fullDescription:
        "An incomplete 17th-century Mughal fort complex started by Prince Muhammad Azam in 1678. Home to the tomb of Pari Bibi, a mosque, and manicured gardens — a surprisingly peaceful escape from the chaos of Old Dhaka's streets.",
      category: "Heritage",
      images: ["https://source.unsplash.com/800x600/?mughal,fort"],
      location: "Old Dhaka",
      entryFee: 20,
      bestTimeToVisit: "Early morning or late afternoon",
      difficulty: "Easy",
      averageRating: 4.5,
      reviews: [],
      addedBy: adminId,
      addedByName: "Admin User",
      createdAt: new Date(),
    },
    {
      title: "Panam Nagar",
      shortDescription: "Abandoned merchant city frozen in time near Sonargaon",
      fullDescription:
        "A ghost street of crumbling 19th-century merchant mansions in Sonargaon, once home to wealthy Hindu textile traders. The decayed facades and overgrown vines make it one of the most photogenic and eerie heritage sites near Dhaka.",
      category: "Heritage",
      images: ["https://source.unsplash.com/800x600/?abandoned,mansion"],
      location: "Sonargaon, Narayanganj",
      entryFee: 0,
      bestTimeToVisit: "Winter mornings (Nov-Feb)",
      difficulty: "Moderate",
      averageRating: 4.7,
      reviews: [],
      addedBy: adminId,
      addedByName: "Admin User",
      createdAt: new Date(),
    },
    {
      title: "Hatirjheel Rooftop View",
      shortDescription: "Best sunset view over Dhaka's lake-side expressway",
      fullDescription:
        "A rooftop cafe overlooking Hatirjheel lake, where the city's skyline reflects off the water as the sun sets behind the bridges. Popular with photographers but still uncrowded on weekday evenings.",
      category: "Rooftop",
      images: ["https://source.unsplash.com/800x600/?rooftop,sunset,city"],
      location: "Hatirjheel, Dhaka",
      entryFee: 0,
      bestTimeToVisit: "Sunset (5:30-6:30 PM)",
      difficulty: "Easy",
      averageRating: 4.3,
      reviews: [],
      addedBy: demoId,
      addedByName: "Demo Explorer",
      createdAt: new Date(),
    },
    {
      title: "Ahsan Manzil Riverside",
      shortDescription: "Pink palace on the Buriganga River",
      fullDescription:
        "The former residence of the Nawab of Dhaka, this pink palace sits directly on the Buriganga River. Beyond the museum inside, the riverside steps are a quiet spot to watch cargo boats drift by at dusk.",
      category: "Heritage",
      images: ["https://source.unsplash.com/800x600/?palace,river"],
      location: "Kumartuli, Old Dhaka",
      entryFee: 100,
      bestTimeToVisit: "Late afternoon",
      difficulty: "Easy",
      averageRating: 4.4,
      reviews: [],
      addedBy: adminId,
      addedByName: "Admin User",
      createdAt: new Date(),
    },
    {
      title: "Diabari Wetlands Trail",
      shortDescription: "Hidden wetland walking trail on Dhaka's northern edge",
      fullDescription:
        "A rarely-visited wetland area near Uttara where seasonal water bodies attract migratory birds in winter. A narrow dirt trail winds through paddy fields — bring water, there's no shade for most of the walk.",
      category: "Park",
      images: ["https://source.unsplash.com/800x600/?wetland,birds"],
      location: "Diabari, Uttara",
      entryFee: 0,
      bestTimeToVisit: "Winter (Dec-Feb) for migratory birds",
      difficulty: "Moderate",
      averageRating: 4.1,
      reviews: [],
      addedBy: demoId,
      addedByName: "Demo Explorer",
      createdAt: new Date(),
    },
    {
      title: "Old Dhaka Street Food Alley",
      shortDescription: "Hidden alley of legendary street food near Chawkbazar",
      fullDescription:
        "An unmarked alley off Chawkbazar packed with third-generation food stalls serving haleem, jilapi, and bakarkhani. Locals know it as the place to eat during Ramadan, but it runs year-round after sunset.",
      category: "Street Food",
      images: ["https://source.unsplash.com/800x600/?street,food,market"],
      location: "Chawkbazar, Old Dhaka",
      entryFee: 0,
      bestTimeToVisit: "Evening, after 6 PM",
      difficulty: "Easy",
      averageRating: 4.8,
      reviews: [],
      addedBy: adminId,
      addedByName: "Admin User",
      createdAt: new Date(),
    },
    {
      title: "Balda Garden",
      shortDescription: "Century-old botanical garden tucked behind city walls",
      fullDescription:
        "A 111-year-old botanical garden hidden behind unassuming walls in Old Dhaka, home to rare cacti, orchids, and a small lake. Most Dhaka residents have never been inside despite passing it daily.",
      category: "Park",
      images: ["https://source.unsplash.com/800x600/?botanical,garden"],
      location: "Wari, Old Dhaka",
      entryFee: 10,
      bestTimeToVisit: "Morning (10 AM - 12 PM)",
      difficulty: "Easy",
      averageRating: 4.2,
      reviews: [],
      addedBy: demoId,
      addedByName: "Demo Explorer",
      createdAt: new Date(),
    },
    {
      title: "Crooked Lane Cafe",
      shortDescription: "Book-lined cafe hidden inside a Dhanmondi alleyway",
      fullDescription:
        "A tiny two-floor cafe tucked into a residential alley, filled floor-to-ceiling with secondhand books you can read while you order. No sign on the main road — you have to know the alley to find it.",
      category: "Cafe",
      images: ["https://source.unsplash.com/800x600/?bookshop,cafe"],
      location: "Dhanmondi, Dhaka",
      entryFee: 0,
      bestTimeToVisit: "Weekday afternoons (quieter)",
      difficulty: "Easy",
      averageRating: 4.6,
      reviews: [],
      addedBy: demoId,
      addedByName: "Demo Explorer",
      createdAt: new Date(),
    },
    {
      title: "Jahangirnagar Lake Trail",
      shortDescription:
        "Quiet lakeside walking loop inside a university campus",
      fullDescription:
        "A shaded 2km walking loop around a lake inside Jahangirnagar University's campus, known for its guest-friendly atmosphere and seasonal migratory birds. Bicycles can be rented at the main gate.",
      category: "Lake",
      images: ["https://source.unsplash.com/800x600/?lake,trail,trees"],
      location: "Savar, Dhaka",
      entryFee: 0,
      bestTimeToVisit: "Early morning",
      difficulty: "Moderate",
      averageRating: 4.5,
      reviews: [],
      addedBy: adminId,
      addedByName: "Admin User",
      createdAt: new Date(),
    },
    {
      title: "Star Mosque Mosaic Courtyard",
      shortDescription: "Star-tiled mosque courtyard rarely seen by tourists",
      fullDescription:
        "A small mosque in Old Dhaka covered floor-to-dome in star-motif mosaic tiles, some original from the 18th century, others added during a Japanese-funded 1980s restoration using broken china plates.",
      category: "Heritage",
      images: ["https://source.unsplash.com/800x600/?mosaic,mosque"],
      location: "Armanitola, Old Dhaka",
      entryFee: 0,
      bestTimeToVisit: "Mid-morning, outside prayer times",
      difficulty: "Easy",
      averageRating: 4.6,
      reviews: [],
      addedBy: adminId,
      addedByName: "Admin User",
      createdAt: new Date(),
    },
  ];

  await spots.insertMany(spotData);

  console.log(`Seeded ${spotData.length} spots.`);
  console.log("Demo credentials:");
  console.log("  Admin -> admin@hiddenspot.com / admin123");
  console.log("  User  -> demo@hiddenspot.com / demo123");

  process.exit(0);
};

run().catch((err) => {
  console.error("Seeding failed:", err);
  process.exit(1);
});
