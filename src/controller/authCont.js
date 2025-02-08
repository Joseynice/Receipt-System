const User = require('../models/userModel');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

module.exports = {
      //Register new user
    registerUser: async (req, res) => {
    
            const { username, email, password } = req.body;
            
           
            
            const nameReg = /^[A-Za-z\s\-']{2,30}$/
            const emailReg = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/
            const passwordReg = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/

            try {
                if(!nameReg.test(username)){
                    return res.status(400).json({ message: 'Invalid username' });
                }
                if(!emailReg.test(email)){
                    return res.status(400).json({ message: 'Invalid email' });
                }
                if(!passwordReg.test(password)){
                    return res.status(400).json({ message: 'Invalid password' });
                }

                // Check if email already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: 'Email already in use' });
        }
                 // Hash password
              const hashedPassword = await bcrypt.hash(password, 10); 
                const newUser = new User({
                    username,
                    email,
                    password: hashedPassword
                });
                await newUser.save();
                return res.status(201).json({ message: 'User created successfully Please Login' });
                 

            } catch (error) {
                console.error("Registration Error:", error);
                
                return res.status(500).json({ message: 'Internal server error' });   
            }
},
          //Login user
          loginUser: async (req, res) => {

            const { email, password } = req.body;
            const emailReg = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/
            const passwordReg = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/

            try {
                console.log("Login attempt for:", email);
                const user = await User.findOne({email});
                if(!user){
                    console.log("User not found for email:", email);
                    return res.status(400).json('Invalid email or password');
                }
                console.log("User found:", user.email);

                
    
                const isMatch = await bcrypt.compare(password, user.password);  // Compare hashed password
                console.log("Password match result:", isMatch);
                if (!isMatch) {
                    return res.status(400).json({ message: 'Invalid credentials' });
                }
    
                // Generate JWT token
                const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });

                console.log("User logged in successfully:", user.email);
                return res.status(200).json({ message: 'Login successful', token });
    
                
                
            } catch (error) {
                console.error("Login error:", error);
                
                res.status(500).json('Internal server error');
                
            }

        }


};