import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding Estate Plus CRM database...");

  // Clean existing data
  await prisma.timelineEvent.deleteMany();
  await prisma.priceHistory.deleteMany();
  await prisma.propertyDocument.deleteMany();
  await prisma.propertyImage.deleteMany();
  await prisma.unit.deleteMany();
  await prisma.tower.deleteMany();
  await prisma.property.deleteMany();
  await prisma.project.deleteMany();
  await prisma.owner.deleteMany();

  // ─── Owners ──────────────────────────────────────────────────
  const owners = await Promise.all([
    prisma.owner.create({
      data: {
        name: "Rajesh Sharma",
        email: "rajesh.sharma@gmail.com",
        phone: "9876543210",
        type: "individual",
        notes: "Regular investor, prefers residential properties in South Delhi",
      },
    }),
    prisma.owner.create({
      data: {
        name: "Priya Patel",
        email: "priya.patel@outlook.com",
        phone: "9812345678",
        type: "individual",
        notes: "NRI investor based in Dubai, looking for premium apartments",
      },
    }),
    prisma.owner.create({
      data: {
        name: "Oberoi Realty Ltd",
        email: "sales@oberoirealty.com",
        phone: "9800112233",
        company: "Oberoi Realty",
        type: "builder",
        notes: "Premium developer, Mumbai focus",
      },
    }),
    prisma.owner.create({
      data: {
        name: "DLF Limited",
        email: "contact@dlf.in",
        phone: "9811223344",
        company: "DLF",
        type: "developer",
        notes: "Major developer across NCR region",
      },
    }),
    prisma.owner.create({
      data: {
        name: "Sunil Kapoor",
        email: "sunil.kapoor@yahoo.com",
        phone: "9898765432",
        type: "individual",
        notes: "Owns multiple commercial spaces in Connaught Place",
      },
    }),
    prisma.owner.create({
      data: {
        name: "Meera Reddy",
        email: "meera.reddy@gmail.com",
        phone: "9845678901",
        type: "individual",
        notes: "First-time seller, property in Hyderabad",
      },
    }),
    prisma.owner.create({
      data: {
        name: "Godrej Properties",
        email: "info@godrejproperties.com",
        phone: "9822334455",
        company: "Godrej Properties",
        type: "developer",
        notes: "Pan-India presence, sustainable development focus",
      },
    }),
    prisma.owner.create({
      data: {
        name: "Arun Mehta",
        email: "arun.mehta@gmail.com",
        phone: "9876123456",
        type: "individual",
        notes: "Looking to liquidate portfolio, multiple properties in Pune",
      },
    }),
    prisma.owner.create({
      data: {
        name: "Brigade Group",
        email: "sales@brigadegroup.com",
        phone: "9844556677",
        company: "Brigade Group",
        type: "developer",
        notes: "Bangalore-based, mixed-use developments",
      },
    }),
    prisma.owner.create({
      data: {
        name: "Kavitha Nair",
        email: "kavitha.nair@gmail.com",
        phone: "9847890123",
        type: "individual",
        notes: "Rental property owner in Kochi",
      },
    }),
  ]);

  console.log(`  ✅ Created ${owners.length} owners`);

  // ─── Properties ──────────────────────────────────────────────
  const propertyData = [
    {
      title: "Luxe 3BHK Apartment in Bandra West",
      description: "Premium sea-facing apartment with modern interiors, modular kitchen, and 24/7 security. Close to Linking Road and Bandstand promenade.",
      type: "residential", subtype: "apartment", status: "available",
      price: 45000000, area: 1850, bedrooms: 3, bathrooms: 3,
      address: "14th Floor, Sea Breeze Tower, Carter Road", city: "Mumbai", state: "Maharashtra", pincode: "400050",
      ownerId: owners[2].id, ownerName: "Oberoi Realty Ltd", ownerPhone: "9800112233",
    },
    {
      title: "Spacious 4BHK Villa in Jubilee Hills",
      description: "Independent villa with private garden, swimming pool, and home theater. Gated community with 3-tier security.",
      type: "residential", subtype: "villa", status: "available",
      price: 85000000, area: 4500, bedrooms: 4, bathrooms: 5,
      address: "Plot 42, Road No. 10, Jubilee Hills", city: "Hyderabad", state: "Telangana", pincode: "500033",
      ownerId: owners[5].id, ownerName: "Meera Reddy", ownerPhone: "9845678901",
    },
    {
      title: "Premium Office Space in Cyber City",
      description: "Fully furnished Grade-A office space with 50 workstations, 2 conference rooms, and pantry. Metro connectivity.",
      type: "commercial", subtype: "office", status: "available",
      price: 32000000, area: 3200, bedrooms: null, bathrooms: 2,
      address: "Tower B, 8th Floor, DLF Cyber City", city: "Gurugram", state: "Haryana", pincode: "122002",
      ownerId: owners[3].id, ownerName: "DLF Limited", ownerPhone: "9811223344",
    },
    {
      title: "2BHK Apartment for Rent in Koramangala",
      description: "Well-maintained apartment in prime location. Walking distance to restaurants, shopping, and tech parks.",
      type: "rental", subtype: "apartment", status: "rented",
      price: 35000, area: 1100, bedrooms: 2, bathrooms: 2,
      address: "3rd Floor, Prestige Ozone, 1st Block", city: "Bangalore", state: "Karnataka", pincode: "560034",
      ownerId: owners[8].id, ownerName: "Brigade Group", ownerPhone: "9844556677",
    },
    {
      title: "Resale 3BHK in Powai Lake View",
      description: "Corner unit with stunning lake view. Semi-furnished with woodwork and air conditioning. Building with gymnasium and pool.",
      type: "resale", subtype: "apartment", status: "hold",
      price: 28500000, area: 1450, bedrooms: 3, bathrooms: 2,
      address: "Hiranandani Gardens, Tower 5, 12th Floor", city: "Mumbai", state: "Maharashtra", pincode: "400076",
      ownerId: owners[0].id, ownerName: "Rajesh Sharma", ownerPhone: "9876543210",
    },
    {
      title: "Agricultural Land in Nashik",
      description: "Fertile agricultural land near Sula Vineyards. Water source available. Ideal for farmhouse or vineyard development.",
      type: "plot", subtype: "land", status: "available",
      price: 12000000, area: 43560, bedrooms: null, bathrooms: null,
      address: "Survey No. 156, Gangapur Road", city: "Nashik", state: "Maharashtra", pincode: "422005",
      ownerId: owners[7].id, ownerName: "Arun Mehta", ownerPhone: "9876123456",
    },
    {
      title: "Warehouse Space in Bhiwandi",
      description: "Industrial warehouse with loading docks, 30ft ceiling height, and 24/7 power backup. Near NH3.",
      type: "commercial", subtype: "warehouse", status: "available",
      price: 15000000, area: 12000, bedrooms: null, bathrooms: 1,
      address: "Plot 89, MIDC Phase II, Bhiwandi", city: "Thane", state: "Maharashtra", pincode: "421302",
      ownerId: owners[4].id, ownerName: "Sunil Kapoor", ownerPhone: "9898765432",
    },
    {
      title: "Studio Apartment in Whitefield",
      description: "Compact, fully furnished studio ideal for IT professionals. Smart home features, rooftop pool access.",
      type: "rental", subtype: "studio", status: "available",
      price: 22000, area: 550, bedrooms: 1, bathrooms: 1,
      address: "Block C, Prestige Shantiniketan", city: "Bangalore", state: "Karnataka", pincode: "560066",
      ownerId: owners[8].id, ownerName: "Brigade Group", ownerPhone: "9844556677",
    },
    {
      title: "5BHK Penthouse in Greater Kailash",
      description: "Ultra-luxury penthouse with terrace garden, private elevator, and panoramic city views. Italian marble flooring throughout.",
      type: "residential", subtype: "penthouse", status: "booked",
      price: 120000000, area: 6500, bedrooms: 5, bathrooms: 6,
      address: "Top Floor, DLF Kings Court, Greater Kailash II", city: "New Delhi", state: "Delhi", pincode: "110048",
      ownerId: owners[3].id, ownerName: "DLF Limited", ownerPhone: "9811223344",
    },
    {
      title: "Commercial Shop in Phoenix Mall",
      description: "Prime retail space on ground floor with high footfall. Suitable for fashion retail or F&B outlet.",
      type: "commercial", subtype: "shop", status: "sold",
      price: 55000000, area: 800, bedrooms: null, bathrooms: 1,
      address: "Unit G-42, Phoenix Marketcity", city: "Pune", state: "Maharashtra", pincode: "411014",
      ownerId: owners[7].id, ownerName: "Arun Mehta", ownerPhone: "9876123456",
    },
    {
      title: "3BHK Apartment in Hinjewadi Phase 3",
      description: "New construction, ready to move in. Club house, swimming pool, indoor games. Near Infosys and Wipro campuses.",
      type: "residential", subtype: "apartment", status: "available",
      price: 8500000, area: 1350, bedrooms: 3, bathrooms: 2,
      address: "Wing A, 7th Floor, Godrej Infinity", city: "Pune", state: "Maharashtra", pincode: "411057",
      ownerId: owners[6].id, ownerName: "Godrej Properties", ownerPhone: "9822334455",
    },
    {
      title: "Luxury Villa in Aluva",
      description: "Colonial-style villa with private boat jetty. 4 bedrooms, home office, landscaped garden. Near Cochin International Airport.",
      type: "residential", subtype: "villa", status: "available",
      price: 35000000, area: 3800, bedrooms: 4, bathrooms: 4,
      address: "Riverside Colony, Aluva", city: "Kochi", state: "Kerala", pincode: "683101",
      ownerId: owners[9].id, ownerName: "Kavitha Nair", ownerPhone: "9847890123",
    },
    {
      title: "2BHK Flat for Resale in Noida Extension",
      description: "Well-maintained flat in Gaur City. Near proposed metro station. Society with gymnasium, pool, and kids play area.",
      type: "resale", subtype: "apartment", status: "available",
      price: 4500000, area: 950, bedrooms: 2, bathrooms: 2,
      address: "Tower 16, Gaur City 2, Sector 16C", city: "Greater Noida", state: "Uttar Pradesh", pincode: "201318",
      ownerId: owners[0].id, ownerName: "Rajesh Sharma", ownerPhone: "9876543210",
    },
    {
      title: "Farmhouse Plot in Sohna Road",
      description: "Premium farmhouse plot in gated community. Clubhouse, equestrian track, and organic farming support.",
      type: "plot", subtype: "farmhouse", status: "available",
      price: 25000000, area: 21780, bedrooms: null, bathrooms: null,
      address: "Karma Lakelands, Sohna Road", city: "Gurugram", state: "Haryana", pincode: "122103",
      ownerId: owners[3].id, ownerName: "DLF Limited", ownerPhone: "9811223344",
    },
    {
      title: "1BHK Rental in Andheri East",
      description: "Compact apartment near Andheri station. Ideal for young professionals. Building with lift and security.",
      type: "rental", subtype: "apartment", status: "rented",
      price: 28000, area: 600, bedrooms: 1, bathrooms: 1,
      address: "2nd Floor, Sai Krupa CHS, Marol Naka", city: "Mumbai", state: "Maharashtra", pincode: "400059",
      ownerId: owners[0].id, ownerName: "Rajesh Sharma", ownerPhone: "9876543210",
    },
    {
      title: "Row House in Wagholi",
      description: "3BHK row house with private terrace and parking. Gated township with school and hospital nearby.",
      type: "residential", subtype: "rowhouse", status: "available",
      price: 7200000, area: 1800, bedrooms: 3, bathrooms: 3,
      address: "Nagar Road, Blue Ridge Township", city: "Pune", state: "Maharashtra", pincode: "412207",
      ownerId: owners[6].id, ownerName: "Godrej Properties", ownerPhone: "9822334455",
    },
    {
      title: "NRI Investment - 2BHK in OMR",
      description: "Pre-launch pricing for upcoming project on OMR. Expected handover in 2026. RERA registered.",
      type: "residential", subtype: "apartment", status: "booked",
      price: 6800000, area: 1050, bedrooms: 2, bathrooms: 2,
      address: "Sholinganallur Junction, OMR", city: "Chennai", state: "Tamil Nadu", pincode: "600119",
      ownerId: owners[1].id, ownerName: "Priya Patel", ownerPhone: "9812345678",
    },
    {
      title: "Co-working Office in Indiranagar",
      description: "Plug-and-play office for 20 people. High-speed internet, meeting rooms, cafeteria included. 12-month lease.",
      type: "commercial", subtype: "office", status: "available",
      price: 180000, area: 2000, bedrooms: null, bathrooms: 2,
      address: "2nd Floor, 100 Feet Road, Indiranagar", city: "Bangalore", state: "Karnataka", pincode: "560038",
      ownerId: owners[8].id, ownerName: "Brigade Group", ownerPhone: "9844556677",
    },
    {
      title: "3BHK Sea-Facing Flat in Versova",
      description: "Renovated apartment with balcony overlooking Arabian Sea. New woodwork, modular kitchen, Italian tiles.",
      type: "resale", subtype: "apartment", status: "available",
      price: 38000000, area: 1600, bedrooms: 3, bathrooms: 2,
      address: "10th Floor, Palm Beach Residency", city: "Mumbai", state: "Maharashtra", pincode: "400061",
      ownerId: owners[2].id, ownerName: "Oberoi Realty Ltd", ownerPhone: "9800112233",
    },
    {
      title: "Residential Plot in Electronic City",
      description: "BMRDA-approved plot in developing area. 30x40 site with clear title. Near upcoming metro line.",
      type: "plot", subtype: "land", status: "available",
      price: 4200000, area: 1200, bedrooms: null, bathrooms: null,
      address: "Survey No. 78, Electronic City Phase 2", city: "Bangalore", state: "Karnataka", pincode: "560100",
      ownerId: owners[4].id, ownerName: "Sunil Kapoor", ownerPhone: "9898765432",
    },
    {
      title: "Duplex Apartment in Salt Lake",
      description: "Spacious duplex with terrace. Modern design, 3-side open, in quiet residential area near IT hub.",
      type: "residential", subtype: "apartment", status: "available",
      price: 12500000, area: 2200, bedrooms: 4, bathrooms: 3,
      address: "Block CG, Sector III, Salt Lake City", city: "Kolkata", state: "West Bengal", pincode: "700098",
      ownerId: owners[1].id, ownerName: "Priya Patel", ownerPhone: "9812345678",
    },
    {
      title: "Heritage Villa in Civil Lines",
      description: "Restored colonial-era bungalow with modern amenities. Teak wood interiors, large compound, heritage zone.",
      type: "resale", subtype: "villa", status: "hold",
      price: 95000000, area: 5200, bedrooms: 5, bathrooms: 4,
      address: "12, Rajpur Road, Civil Lines", city: "Jaipur", state: "Rajasthan", pincode: "302006",
      ownerId: owners[4].id, ownerName: "Sunil Kapoor", ownerPhone: "9898765432",
    },
    {
      title: "2BHK Smart Home in Wakad",
      description: "IoT-enabled apartment with voice-controlled lighting, smart locks, and energy monitoring. Gym and rooftop garden.",
      type: "residential", subtype: "apartment", status: "available",
      price: 6200000, area: 980, bedrooms: 2, bathrooms: 2,
      address: "Tower D, 5th Floor, Kolte Patil iVen", city: "Pune", state: "Maharashtra", pincode: "411057",
      ownerId: owners[6].id, ownerName: "Godrej Properties", ownerPhone: "9822334455",
    },
    {
      title: "Retail Space in MG Road",
      description: "Corner shop with excellent visibility. Glass frontage, air-conditioned. Suitable for showroom or bank branch.",
      type: "commercial", subtype: "shop", status: "available",
      price: 72000000, area: 1500, bedrooms: null, bathrooms: 1,
      address: "Ground Floor, Brigade Gateway", city: "Bangalore", state: "Karnataka", pincode: "560001",
      ownerId: owners[8].id, ownerName: "Brigade Group", ownerPhone: "9844556677",
    },
    {
      title: "1BHK Starter Home in Dombivli",
      description: "Affordable housing in upcoming area. Near Dombivli station. Project with children's play area and garden.",
      type: "residential", subtype: "apartment", status: "available",
      price: 3200000, area: 550, bedrooms: 1, bathrooms: 1,
      address: "A-Wing, 4th Floor, Lodha Palava", city: "Thane", state: "Maharashtra", pincode: "421204",
      ownerId: owners[2].id, ownerName: "Oberoi Realty Ltd", ownerPhone: "9800112233",
    },
    {
      title: "4BHK Apartment in Banjara Hills",
      description: "Ultra-premium apartment with private terrace. Italian marble, Grohe fittings, Hettich modular kitchen.",
      type: "residential", subtype: "apartment", status: "sold",
      price: 52000000, area: 3200, bedrooms: 4, bathrooms: 4,
      address: "Floor 15, My Home Bhooja, Road No. 2", city: "Hyderabad", state: "Telangana", pincode: "500034",
      ownerId: owners[5].id, ownerName: "Meera Reddy", ownerPhone: "9845678901",
    },
    {
      title: "Warehouse in Manesar Industrial Area",
      description: "5000 sq ft warehouse with office space attached. Heavy vehicle access, fire safety compliant.",
      type: "commercial", subtype: "warehouse", status: "available",
      price: 8500000, area: 5000, bedrooms: null, bathrooms: 2,
      address: "Plot 34, Sector 8, IMT Manesar", city: "Gurugram", state: "Haryana", pincode: "122052",
      ownerId: owners[3].id, ownerName: "DLF Limited", ownerPhone: "9811223344",
    },
    {
      title: "3BHK Flat for Rent in Magarpatta",
      description: "Fully furnished flat in Magarpatta City. Covered parking, club membership included. 11-month lease.",
      type: "rental", subtype: "apartment", status: "available",
      price: 45000, area: 1400, bedrooms: 3, bathrooms: 2,
      address: "Rohan Akriti, Magarpatta Road", city: "Pune", state: "Maharashtra", pincode: "411028",
      ownerId: owners[7].id, ownerName: "Arun Mehta", ownerPhone: "9876123456",
    },
    {
      title: "Villa Plot in Devanahalli",
      description: "Premium villa plot near Bangalore International Airport. BIAAPA approved. 60ft road facing.",
      type: "plot", subtype: "land", status: "available",
      price: 9500000, area: 2400, bedrooms: null, bathrooms: null,
      address: "Nandi Hills Road, Devanahalli", city: "Bangalore", state: "Karnataka", pincode: "562110",
      ownerId: owners[8].id, ownerName: "Brigade Group", ownerPhone: "9844556677",
    },
    {
      title: "2BHK Flat in Hadapsar",
      description: "Resale flat near Magarpatta IT Park. Good rental yield potential. Semi-furnished with modular kitchen.",
      type: "resale", subtype: "apartment", status: "available",
      price: 5800000, area: 900, bedrooms: 2, bathrooms: 2,
      address: "B-Wing, Amanora Park Town", city: "Pune", state: "Maharashtra", pincode: "411028",
      ownerId: owners[7].id, ownerName: "Arun Mehta", ownerPhone: "9876123456",
    },
  ];

  const properties = [];
  for (const data of propertyData) {
    const property = await prisma.property.create({ data });
    properties.push(property);
  }

  console.log(`  ✅ Created ${properties.length} properties`);

  // ─── Property Images ─────────────────────────────────────────
  for (const property of properties) {
    const imageCount = Math.floor(Math.random() * 4) + 2; // 2-5 images per property
    for (let i = 0; i < imageCount; i++) {
      const seed = Math.floor(Math.random() * 1000);
      await prisma.propertyImage.create({
        data: {
          propertyId: property.id,
          url: `https://picsum.photos/seed/${seed}/800/600`,
          caption: i === 0 ? "Main view" : `View ${i + 1}`,
          order: i,
        },
      });
    }
  }
  console.log("  ✅ Created property images");

  // ─── Price History ───────────────────────────────────────────
  for (const property of properties) {
    const historyCount = Math.floor(Math.random() * 4) + 1;
    let basePrice = property.price * 0.85;
    for (let i = 0; i < historyCount; i++) {
      const monthsAgo = (historyCount - i) * 3;
      const date = new Date();
      date.setMonth(date.getMonth() - monthsAgo);
      await prisma.priceHistory.create({
        data: {
          propertyId: property.id,
          price: Math.round(basePrice),
          date,
          note: i === 0 ? "Initial listing price" : `Price revision ${i}`,
        },
      });
      basePrice *= 1.03 + Math.random() * 0.05;
    }
    // Current price as latest entry
    await prisma.priceHistory.create({
      data: {
        propertyId: property.id,
        price: property.price,
        date: new Date(),
        note: "Current price",
      },
    });
  }
  console.log("  ✅ Created price history");

  // ─── Timeline Events ────────────────────────────────────────
  for (const property of properties) {
    const created = new Date(property.createdAt);
    await prisma.timelineEvent.create({
      data: {
        propertyId: property.id,
        title: "Property Listed",
        description: `${property.title} was listed on the platform`,
        date: created,
        type: "created",
      },
    });

    if (property.status !== "available") {
      const statusDate = new Date(created);
      statusDate.setDate(statusDate.getDate() + Math.floor(Math.random() * 30) + 5);
      await prisma.timelineEvent.create({
        data: {
          propertyId: property.id,
          title: `Status changed to ${property.status}`,
          description: `Property was marked as ${property.status}`,
          date: statusDate,
          type: "status_change",
        },
      });
    }

    // Add random site visit events
    if (Math.random() > 0.4) {
      const visitDate = new Date(created);
      visitDate.setDate(visitDate.getDate() + Math.floor(Math.random() * 15) + 1);
      await prisma.timelineEvent.create({
        data: {
          propertyId: property.id,
          title: "Site Visit Conducted",
          description: "Client visited the property for inspection",
          date: visitDate,
          type: "visit",
        },
      });
    }
  }
  console.log("  ✅ Created timeline events");

  // ─── Documents ───────────────────────────────────────────────
  for (const property of properties) {
    await prisma.propertyDocument.create({
      data: {
        propertyId: property.id,
        name: "Title Deed",
        url: "/documents/sample-title-deed.pdf",
        type: "title_deed",
      },
    });
    if (Math.random() > 0.5) {
      await prisma.propertyDocument.create({
        data: {
          propertyId: property.id,
          name: "Floor Plan",
          url: "/documents/sample-floor-plan.pdf",
          type: "floor_plan",
        },
      });
    }
  }
  console.log("  ✅ Created property documents");

  // ─── Projects ────────────────────────────────────────────────
  const projects = await Promise.all([
    prisma.project.create({
      data: {
        name: "Godrej Infinity",
        builder: "Godrej Properties",
        description: "Premium residential towers in Hinjewadi with world-class amenities including infinity pool, clubhouse, and sports facilities.",
        location: "Hinjewadi Phase 3, Pune",
        status: "active",
        totalUnits: 240,
        brochureUrl: "/documents/sample-brochure.pdf",
        towers: {
          create: [
            {
              name: "Tower A - Zenith",
              totalFloors: 20,
              units: {
                create: generateUnits(20, 4, "A"),
              },
            },
            {
              name: "Tower B - Apex",
              totalFloors: 20,
              units: {
                create: generateUnits(20, 4, "B"),
              },
            },
            {
              name: "Tower C - Crown",
              totalFloors: 20,
              units: {
                create: generateUnits(20, 4, "C"),
              },
            },
          ],
        },
      },
    }),
    prisma.project.create({
      data: {
        name: "DLF The Camellias",
        builder: "DLF Limited",
        description: "Ultra-luxury residential development in Golf Course Road with private elevators, concierge services, and designer interiors.",
        location: "Sector 42, Golf Course Road, Gurugram",
        status: "active",
        totalUnits: 128,
        brochureUrl: "/documents/sample-brochure.pdf",
        towers: {
          create: [
            {
              name: "North Wing",
              totalFloors: 16,
              units: {
                create: generateUnits(16, 4, "N"),
              },
            },
            {
              name: "South Wing",
              totalFloors: 16,
              units: {
                create: generateUnits(16, 4, "S"),
              },
            },
          ],
        },
      },
    }),
    prisma.project.create({
      data: {
        name: "Brigade El Dorado",
        builder: "Brigade Group",
        description: "Integrated township with residential, commercial, and retail spaces. Features lake-facing towers and expansive green spaces.",
        location: "Bagalur Road, North Bangalore",
        status: "upcoming",
        totalUnits: 480,
        towers: {
          create: [
            {
              name: "Eden Tower",
              totalFloors: 25,
              units: {
                create: generateUnits(25, 6, "E"),
              },
            },
            {
              name: "Flora Tower",
              totalFloors: 25,
              units: {
                create: generateUnits(25, 6, "F"),
              },
            },
            {
              name: "Vista Tower",
              totalFloors: 20,
              units: {
                create: generateUnits(20, 4, "V"),
              },
            },
          ],
        },
      },
    }),
  ]);

  console.log(`  ✅ Created ${projects.length} projects with towers and units`);
  console.log("\n🎉 Seeding complete!");
}

function generateUnits(floors: number, unitsPerFloor: number, prefix: string) {
  const types = ["2BHK", "3BHK", "3BHK", "4BHK"];
  const statuses = ["available", "available", "available", "sold", "booked", "hold"];
  const units = [];

  for (let floor = 1; floor <= floors; floor++) {
    for (let unit = 1; unit <= unitsPerFloor; unit++) {
      const typeIndex = (unit - 1) % types.length;
      const unitType = types[typeIndex];
      const bedrooms = parseInt(unitType);
      const baseArea = bedrooms === 2 ? 950 : bedrooms === 3 ? 1350 : 1850;
      const basePrice = bedrooms === 2 ? 5500000 : bedrooms === 3 ? 7800000 : 12000000;
      const floorPremium = floor * 50000;

      units.push({
        unitNumber: `${prefix}${floor.toString().padStart(2, "0")}${unit.toString().padStart(2, "0")}`,
        floor,
        type: unitType,
        superArea: baseArea + Math.floor(Math.random() * 200),
        price: basePrice + floorPremium + Math.floor(Math.random() * 500000),
        status: statuses[Math.floor(Math.random() * statuses.length)],
        bedrooms,
        bathrooms: bedrooms,
      });
    }
  }
  return units;
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
