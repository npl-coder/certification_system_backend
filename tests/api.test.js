const request = require("supertest");
const app = require("../app.test");
const { db } = require("../config/database");

describe("Health Check", () => {
  test("GET /health should return 200", async () => {
    const response = await request(app).get("/health").expect(200);

    expect(response.body).toHaveProperty("success", true);
    expect(response.body).toHaveProperty("message", "API is running");
  });
});

describe("Authentication", () => {
  let authToken;
  const testUser = {
    name: "Test User",
    email: "test@example.com",
    password: "password123",
    role: "user",
  };

  const adminUser = {
    name: "Admin User",
    email: "admin@example.com",
    password: "admin123",
    role: "admin",
  };

  test("POST /api/auth/register should create a new user", async () => {
    const response = await request(app)
      .post("/api/auth/register")
      .send(testUser)
      .expect(201);

    expect(response.body).toHaveProperty("success", true);
    expect(response.body).toHaveProperty("data");
    expect(response.body.data).toHaveProperty("user");
    expect(response.body.data.user.email).toBe(testUser.email);
  });

  test("POST /api/auth/register should create an admin user", async () => {
    const response = await request(app)
      .post("/api/auth/register")
      .send(adminUser)
      .expect(201);

    expect(response.body).toHaveProperty("success", true);
    expect(response.body.data.user.role).toBe("admin");
  });

  test("POST /api/auth/login should authenticate user", async () => {
    const response = await request(app)
      .post("/api/auth/login")
      .send({
        email: testUser.email,
        password: testUser.password,
      })
      .expect(200);

    expect(response.body).toHaveProperty("success", true);
    expect(response.body).toHaveProperty("token");
    authToken = response.body.token;
  });

  test("GET /api/auth/me should return user profile", async () => {
    const response = await request(app)
      .get("/api/auth/me")
      .set("Authorization", `Bearer ${authToken}`)
      .expect(200);

    expect(response.body).toHaveProperty("success", true);
    expect(response.body.data.email).toBe(testUser.email);
  });

  test("POST /api/auth/login should fail with wrong credentials", async () => {
    await request(app)
      .post("/api/auth/login")
      .send({
        email: testUser.email,
        password: "wrongpassword",
      })
      .expect(401);
  });
});

describe("Categories", () => {
  let adminToken;
  let categoryId;

  beforeAll(async () => {
    // Login as admin to get token
    const adminLoginResponse = await request(app).post("/api/auth/login").send({
      email: "admin@example.com",
      password: "admin123",
    });
    adminToken = adminLoginResponse.body.token;
  });

  test("GET /api/categories should return empty categories list", async () => {
    const response = await request(app).get("/api/categories").expect(200);

    expect(response.body).toHaveProperty("success", true);
    expect(response.body.data).toBeInstanceOf(Array);
  });

  test("POST /api/categories should create a new category (admin)", async () => {
    const category = {
      name: "Programming Contest",
      description: "Programming competitions and contests",
    };

    const response = await request(app)
      .post("/api/categories")
      .set("Authorization", `Bearer ${adminToken}`)
      .send(category)
      .expect(201);

    expect(response.body).toHaveProperty("success", true);
    expect(response.body.data.name).toBe(category.name);
    categoryId = response.body.data.category_id;
  });

  test("GET /api/categories/:id should return specific category", async () => {
    const response = await request(app)
      .get(`/api/categories/${categoryId}`)
      .expect(200);

    expect(response.body).toHaveProperty("success", true);
    expect(response.body.data.category_id).toBe(categoryId);
  });

  test("PUT /api/categories/:id should update category (admin)", async () => {
    const updatedCategory = {
      name: "Updated Programming Contest",
      description: "Updated description",
    };

    const response = await request(app)
      .put(`/api/categories/${categoryId}`)
      .set("Authorization", `Bearer ${adminToken}`)
      .send(updatedCategory)
      .expect(200);

    expect(response.body).toHaveProperty("success", true);
    expect(response.body.data.name).toBe(updatedCategory.name);
  });

  test("POST /api/categories should fail without admin token", async () => {
    const category = {
      name: "Unauthorized Category",
      description: "This should fail",
    };

    await request(app).post("/api/categories").send(category).expect(401);
  });
});

describe("Events", () => {
  let adminToken;
  let eventId;
  let categoryId;

  beforeAll(async () => {
    // Login as admin
    const adminLoginResponse = await request(app).post("/api/auth/login").send({
      email: "admin@example.com",
      password: "admin123",
    });
    adminToken = adminLoginResponse.body.token;

    // Create a category first
    const categoryResponse = await request(app)
      .post("/api/categories")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({
        name: "Test Category for Events",
        description: "Category for testing events",
      });
    categoryId = categoryResponse.body.data.category_id;
  });

  test("GET /api/events should return empty events list", async () => {
    const response = await request(app).get("/api/events").expect(200);

    expect(response.body).toHaveProperty("success", true);
    expect(response.body.data).toBeInstanceOf(Array);
  });

  test("POST /api/events should create a new event (admin)", async () => {
    const event = {
      name: "NPL Coder Programming Contest",
      description: "Annual programming contest for developers",
      eventDate: new Date().toISOString(),
      location: "Kathmandu, Nepal",
      categoryId: categoryId,
    };

    const response = await request(app)
      .post("/api/events")
      .set("Authorization", `Bearer ${adminToken}`)
      .send(event)
      .expect(201);

    expect(response.body).toHaveProperty("success", true);
    expect(response.body.data.name).toBe(event.name);
    eventId = response.body.data.event_id;
  });

  test("GET /api/events/:id should return specific event", async () => {
    const response = await request(app)
      .get(`/api/events/${eventId}`)
      .expect(200);

    expect(response.body).toHaveProperty("success", true);
    expect(response.body.data.event_id).toBe(eventId);
  });

  test("PUT /api/events/:id should update event (admin)", async () => {
    const updatedEvent = {
      name: "Updated NPL Coder Contest",
      description: "Updated description",
      location: "Online",
    };

    const response = await request(app)
      .put(`/api/events/${eventId}`)
      .set("Authorization", `Bearer ${adminToken}`)
      .send(updatedEvent)
      .expect(200);

    expect(response.body).toHaveProperty("success", true);
    expect(response.body.data.name).toBe(updatedEvent.name);
  });
});

describe("Certificates", () => {
  let userToken;
  let adminToken;

  beforeAll(async () => {
    // Login as user
    const userLoginResponse = await request(app).post("/api/auth/login").send({
      email: "test@example.com",
      password: "password123",
    });
    userToken = userLoginResponse.body.token;

    // Login as admin
    const adminLoginResponse = await request(app).post("/api/auth/login").send({
      email: "admin@example.com",
      password: "admin123",
    });
    adminToken = adminLoginResponse.body.token;
  });

  test("GET /api/certificates/my-certificates should return user certificates", async () => {
    const response = await request(app)
      .get("/api/certificates/my-certificates")
      .set("Authorization", `Bearer ${userToken}`)
      .expect(200);

    expect(response.body).toHaveProperty("success", true);
    expect(response.body.data).toBeInstanceOf(Array);
  });

  test("GET /api/certificates/admin should return all certificates (admin)", async () => {
    const response = await request(app)
      .get("/api/certificates/admin")
      .set("Authorization", `Bearer ${adminToken}`)
      .expect(200);

    expect(response.body).toHaveProperty("success", true);
    expect(response.body.data).toBeInstanceOf(Array);
  });

  test("GET /api/certificates/verify/:id should verify certificate", async () => {
    // This will return 404 since no certificate exists yet
    await request(app).get("/api/certificates/verify/CERT-001").expect(404);
  });

  test("GET /api/certificates/admin should fail without admin token", async () => {
    await request(app)
      .get("/api/certificates/admin")
      .set("Authorization", `Bearer ${userToken}`)
      .expect(403);
  });
});

describe("Email Services", () => {
  let adminToken;

  beforeAll(async () => {
    // Login as admin
    const adminLoginResponse = await request(app).post("/api/auth/login").send({
      email: "admin@example.com",
      password: "admin123",
    });
    adminToken = adminLoginResponse.body.token;
  });

  test("GET /api/emails/status should return email status (admin)", async () => {
    const response = await request(app)
      .get("/api/emails/status")
      .set("Authorization", `Bearer ${adminToken}`)
      .expect(200);

    expect(response.body).toHaveProperty("success", true);
  });

  test("POST /api/emails/send/:id should fail for non-existent certificate", async () => {
    await request(app)
      .post("/api/emails/send/999")
      .set("Authorization", `Bearer ${adminToken}`)
      .expect(404);
  });
});
