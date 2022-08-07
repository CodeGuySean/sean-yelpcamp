const mongoose = require("mongoose");
const cities = require("./cities");
const { places, descriptors } = require("./seedHelpers");
const Campground = require("../models/campground");

mongoose.connect("mongodb://localhost:27017/yeld-camp");
    // useNewUrlParser: true,
    // useCreateIndex: true,
    // useUnifiedTopology: true

const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", ()=> {
    console.log("Database connected");
});

const sample = array => array[Math.floor(Math.random() * array.length)]

const seedDB = async() => {
    await Campground.deleteMany({});
    
    for(let i = 0; i < 50; i++) {
        const random1000 = Math.floor(Math.random() * 1000);
        const price = Math.floor(Math.random() * 30) + 10;
        const camp = new Campground({
            author: "62e528fe4716ef7198e0dca7",
            location: `${cities[random1000].city}, ${cities[random1000].state}`,
            title: `${sample(descriptors)} ${sample(places)}`,
            images: [
                {
                  url: 'https://res.cloudinary.com/seanbean/image/upload/v1659365008/YeldCamp/oxtvezwn3vhkztahpxax.jpg',
                  filename: 'YeldCamp/oxtvezwn3vhkztahpxax',
                }
            ],
            description: "Unsplash was born from the pain we had in finding great, usable imagery. And we weren’t alone. Which is why, today—millions of creators from around the world have downloaded over 4 billion Unsplash images to create presentations, artwork, mockups, and more.",
            price
        })
        await camp.save();
    }
}

seedDB().then( () => {
    mongoose.connection.close();
})