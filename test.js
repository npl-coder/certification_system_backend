const { sequelize, User, Category, Event, Certificate } = require("./models");
const { v4: uuidv4 } = require("uuid");

async function testModels() {
  try {
    await sequelize.sync({ force: true });
    console.log("Database synced!");

    // Create a User
    const user = await User.create({
      name: "Aashish",
      email: "ak@example.com",
      password: "password",
      role: "admin",
    });
    console.log("User created:", user.toJSON());

    //Create a category
    const category = await Category.create({
      name: "NOI",
      description: "Nepal Olympiad of Informatics",
    });
    console.log("Category created:", category.toJSON());

    //Create an event
    const event = await Event.create({
      name: "Algorithm ko shreepeech",
      description: "Algo war",
      eventDate: new Date(),
      location: "Online",
      categoryId: category.category_id,
    });

    // Fetch Code

    console.log("Event created:", event.toJSON());

    // Create a certificate
    const certificate = await Certificate.create({
      recipientName: user.name,
      recipientEmail: user.email,
      certificateNumber: "CERT-001",
      issueDate: new Date(),
      templatePath: "/templates/template1.png",
      certificatePath: "/certificates/cert1.pdf",
      verificationUrl: "https://example.com/verify/CERT-001",
      isVerified: true,
      emailSent: true,
      eventId: event.event_id,
      issuedTo: user.user_id,
    });
    console.log("Certificate created:", certificate.toJSON());

    // Fetch certificate with associations
    const certWithAssociations = await Certificate.findOne({
      where: { certificateNumber: "CERT-001" },
      include: [{ model: User, as: "recepient" }, { model: Event }],
    });
    console.log(
      "Certificate with associations:",
      JSON.stringify(certWithAssociations, null, 2)
    );

    // Fetch user with received certificates
    const userWithCertificates = await User.findOne({
      where: { email: "ak@example.com" },
      include: [{ model: Certificate, as: "receivedCertificates" }],
    });
    console.log(
      "User with certificates:",
      JSON.stringify(userWithCertificates, null, 2)
    );

    process.exit(0);
  } catch (err) {
    console.error('Test failed:', err);
    process.exit(1);
  }
}


testModels();