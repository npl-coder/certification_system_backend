// Debug utility to check database state
const { Event, Category } = require('./models');

async function checkDatabaseState() {
  try {
    console.log('=== Database State Check ===\n');
    
    // Check database connection
    const { sequelize } = require('./models');
    await sequelize.authenticate();
    console.log('✅ Database connection successful');
    
    // Check events
    console.log('\n--- Events in Database ---');
    const events = await Event.findAll({
      include: [{
        model: Category,
        attributes: ['category_id', 'name']
      }],
      attributes: ['event_id', 'name', 'eventDate', 'categoryId']
    });
    
    if (events.length === 0) {
      console.log('❌ No events found in database');
      console.log('💡 You need to create an event first to test certificate generation');
    } else {
      console.log(`✅ Found ${events.length} event(s):`);
      events.forEach(event => {
        console.log(`  - ID: ${event.event_id}`);
        console.log(`    Name: ${event.name}`);
        console.log(`    Date: ${event.eventDate}`);
        console.log(`    Category: ${event.Category ? event.Category.name : 'None'}`);
        console.log('');
      });
    }
    
    // Check categories
    console.log('--- Categories in Database ---');
    const categories = await Category.findAll({
      attributes: ['category_id', 'name']
    });
    
    if (categories.length === 0) {
      console.log('❌ No categories found in database');
    } else {
      console.log(`✅ Found ${categories.length} categor${categories.length === 1 ? 'y' : 'ies'}:`);
      categories.forEach(category => {
        console.log(`  - ID: ${category.category_id}, Name: ${category.name}`);
      });
    }
    
    // Return useful data for testing
    return {
      events: events.map(e => ({
        id: e.event_id,
        name: e.name,
        date: e.eventDate
      })),
      categories: categories.map(c => ({
        id: c.category_id,
        name: c.name
      }))
    };
    
  } catch (error) {
    console.error('❌ Database error:', error.message);
    throw error;
  }
}

// Function to create a test event if none exist
async function createTestEvent() {
  try {
    // Check if we need to create a category first
    let category = await Category.findOne();
    if (!category) {
      console.log('Creating test category...');
      category = await Category.create({
        name: 'Test Category',
        description: 'Category for testing certificate generation'
      });
      console.log('✅ Test category created:', category.category_id);
    }
    
    // Create test event
    console.log('Creating test event...');
    const event = await Event.create({
      name: 'Test Programming Contest 2025',
      description: 'Test event for certificate generation',
      eventDate: new Date('2025-08-04'),
      location: 'Test Location',
      categoryId: category.category_id
    });
    
    console.log('✅ Test event created:');
    console.log(`  ID: ${event.event_id}`);
    console.log(`  Name: ${event.name}`);
    console.log(`  Date: ${event.eventDate}`);
    
    return event;
    
  } catch (error) {
    console.error('❌ Error creating test event:', error.message);
    throw error;
  }
}

// Run if called directly
if (require.main === module) {
  checkDatabaseState()
    .then(data => {
      console.log('\n=== Summary ===');
      if (data.events.length === 0) {
        console.log('💡 Consider running: node -e "require(\'./debug-db.js\').createTestEvent()"');
      } else {
        console.log('✅ Database is ready for testing');
        console.log('💡 Use one of these event IDs in your API calls:');
        data.events.forEach(event => {
          console.log(`  ${event.id} (${event.name})`);
        });
      }
      process.exit(0);
    })
    .catch(error => {
      console.error('Database check failed:', error);
      process.exit(1);
    });
}

module.exports = { checkDatabaseState, createTestEvent };
