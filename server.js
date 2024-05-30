const express = require('express');
const path = require('path');
const fs = require('fs');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const mongoose = require('mongoose');
const User = require('./models/user');
const Order = require('./models/order'); // Import the Order model

require('dotenv').config();
const cors = require('cors');

const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads'))); // Ensure this line is correct

mongoose.connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => {
    console.log('Connected to MongoDB');
}).catch((error) => {
    console.error('Error connecting to MongoDB:', error);
});

// Ensure the uploads directory exists
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir);
}

// Configure multer for file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadsDir);
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + '-' + file.originalname);
    }
});

const upload = multer({ storage: storage });

// Middleware to verify token
const verifyToken = (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
        return res.status(401).json({ message: 'Access denied. Token is required.' });
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
        return res.status(401).json({ message: 'Access denied. Token is required.' });
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
        if (err) {
            return res.status(403).json({ message: 'Invalid token' });
        }
        req.userId = decoded.userId;
        next();
    });
};

// Profile update endpoint
app.post('/profile/update', verifyToken, upload.single('profileImage'), async (req, res) => {
    const { name, email, contactNumber } = req.body;
    const profileImage = req.file ? req.file.path : null;

    try {
        const user = await User.findById(req.userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        user.name = name || user.name;
        user.email = email || user.email;
        user.contactNumber = contactNumber || user.contactNumber;
        if (profileImage) {
            user.profileImage = profileImage;
        }

        await user.save();
        res.status(200).json({ message: 'Profile updated successfully' });
    } catch (error) {
        console.error('Error updating profile:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});


// Endpoint to fetch the profile image
app.get('/api/profile/image', verifyToken, async (req, res) => {
    try {
        const user = await User.findById(req.userId);
        if (!user || !user.profileImage) {
            return res.status(404).json({ message: 'Image not found' });
        }

        res.status(200).json({ imageUrl: `/uploads/${path.basename(user.profileImage)}` });
    } catch (error) {
        console.error('Error fetching profile image:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});
// POST endpoint to create an order for a specific user
app.post('/api/orders', verifyToken, async (req, res) => {
    try {
        const user = await User.findById(req.userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Log the request body
        console.log('Request body:', req.body);

        // Assuming you receive order details in the request body
        const { curry, quantity, price, imageurl } = req.body;

        if (!imageurl) {
            return res.status(400).json({ message: 'Image URL is required' });
        }

        // Create a new order with the current date
        const order = new Order({
            curry,
            quantity,
            date: new Date(), // Set the current date
            price,
            imageurl, // Assuming the image URL is provided in the request body
            user: user._id // Associate the order with the user
        });

        // Save the order to the database
        await order.save();

        res.status(201).json({ message: 'Order created successfully', order });
    } catch (error) {
        console.error('Error creating order:', error); // Log the error
        res.status(500).json({ message: 'Internal server error' });
    }
});

// GET endpoint to retrieve all orders for the authenticated user
app.get('/api/orders', verifyToken, async (req, res) => {
    try {
        const user = await User.findById(req.userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Retrieve all orders for the authenticated user
        const orders = await Order.find({ user: user._id });

        res.status(200).json({ orders });
    } catch (error) {
        console.error('Error fetching orders:', error); // Log the error
        res.status(500).json({ message: 'Internal server error' });
    }
});

// Serve CSS files
app.get('/css/:file', (req, res) => {
    res.sendFile(path.join(__dirname, 'template/css', req.params.file));
});

// Serve JS files
app.get('/js/:file', (req, res) => {
    res.sendFile(path.join(__dirname, 'template/js', req.params.file));
});

// Serve image files
app.get('/images/:file', (req, res) => {
    res.sendFile(path.join(__dirname, 'template/images', req.params.file));
});
// Serve JS files
app.get('/video/:file', (req, res) => {
    res.sendFile(path.join(__dirname, 'template/video', req.params.file));
});

// Signup endpoint
app.post('/signup', async (req, res) => {
    const { name, email, contactNumber, password, confirmPassword } = req.body;

    if (!confirmPassword) {
        return res.status(400).json({ message: 'Confirm password is required' });
    }

    if (password !== confirmPassword) {
        return res.status(400).json({ message: 'Passwords do not match' });
    }

    try {
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: 'User already exists' });
        }

        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        const newUser = new User({
            name,
            email,
            contactNumber,
            password: hashedPassword
        });

        await newUser.save();
        res.status(201).json({ message: 'User created successfully' });
    } catch (error) {
        console.error('Error signing up:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// Login endpoint
app.post('/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(401).json({ message: 'Invalid password' });
        }

        const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
        res.status(200).json({ token });
    } catch (error) {
        console.error('Error logging in:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// Serve login page at the root URL
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'template/index.html'));
});

// Restricted route example
app.get('/home', (req, res) => {
    console.log('Request headers:', req.headers);
    res.sendFile(path.join(__dirname, 'template/zhay-go-home-page.html'));
});

app.get('/potato', (req, res) => {
    res.sendFile(path.join(__dirname, 'template/Potato.html'));
});
app.get('/emadatsi', (req, res) => {
    res.sendFile(path.join(__dirname, 'template/emadatsi.html'));
});
app.get('/asparagus', (req, res) => {
    res.sendFile(path.join(__dirname, 'template/Asparagus.html'));
});
app.get('/spinach', (req, res) => {
    res.sendFile(path.join(__dirname, 'template/Spinach.html'));
});
// Signup page route
app.get('/signup', (req, res) => {
    res.sendFile(path.join(__dirname, 'template/signup.html'));
});
app.get('/payment', (req, res) => {
    res.sendFile(path.join(__dirname, 'template/payment.html'));
});
app.get('/aboutus', (req, res) => {
    res.sendFile(path.join(__dirname, 'template/zhay-go-about-us-page.html'));
});

app.get('/cart', (req, res) => {
    res.sendFile(path.join(__dirname, 'template/cart.html'));
});

app.get('/menu', (req, res) => {
    res.sendFile(path.join(__dirname, 'template/our-menu.html'));
});

app.get('/mountaincafe', (req, res) => {
    res.sendFile(path.join(__dirname, 'template/mountain-cafe.html'));
});

app.get('/villagerestaurant', (req, res) => {
    res.sendFile(path.join(__dirname, 'template/village-restaurant.html'));
});

app.get('/profile', (req, res) => {
    res.sendFile(path.join(__dirname, 'template/profile.html'));
});
app.get('/order', (req, res) => {
    res.sendFile(path.join(__dirname, 'template/order.html'));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
