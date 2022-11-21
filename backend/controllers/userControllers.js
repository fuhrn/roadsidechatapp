const asyncHandler = require("express-async-handler");
const generateToken = require("../config/generateToken");
const User = require("../models/userModel");

//@description     Register new user
//@route           POST /api/user/
//@access          Public
const registerUser = asyncHandler(async (req, res) => {
  const { name, email, password, pic } = req.body;
  // console.log('back: ', req.body)
  if (!name || !email || !password) {
    res.status(400);
    throw new Error("Please enter all fields required.");
  }

  const userExists = await User.findOne({ email });

  if (userExists) {
    res.status(400);
    throw new Error("User already exists.");
  }

  const user = await User.create({
    name,
    email,
    password,
    pic,
  });

  // console.log("user back: ", user)

  if (user) {
    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      pic: user.pic,
      token: generateToken(user._id),
    });
  } else {
    res.status(400);
    throw new Error("Failed to create new user.");
  }
});



const authUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  // console.log("body: ", email, password);

  const user = await User.findOne({ email });

  if (user && (await user.matchPassword(password))) {
    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      pic: user.pic,
      token: generateToken(user._id),
    });
  } else {
    res.status(401);
    throw new Error("Invalid Email or Password.");
  }
});

//@description     Get or Search all users, salvo el que haga la consulta
//@route           GET /api/user?search=
//@access          Public
const allUsers = asyncHandler(async (req, res) => {
  //search es la keyword con la traigo los key:value pairs desde el "?" query. En vez de "search" obvio se puede llamar de cualquier manera
  //  syntax
  // { <field>: { $regex: /pattern/, $options: '<options>' } }
  // { <field>: { $regex: 'pattern', $options: '<options>' } }
  // { <field>: { $regex: /pattern/<options> } }
  // -> 'pattern' = req.query.search
  // 'i' -> insensitive.
  // busca los documentos en los que el campo mail o name match 'pattern' strings
  const keyword = req.query.search
    ? {
        $or: [
          { name: { $regex: req.query.search, $options: "i" } },
          { email: { $regex: req.query.search, $options: "i" } },
        ],
      }
    : {};
  
  // consulto todos los usuarios que matchean el string en sus campos name o mail
  // salvo ('$ne', not equal) el usuario que esta haciendo la consulta
  // el middleware 'protect' es el que agrego a 'req' el objeto 'user'
    const users = await User.find(keyword).find({ _id: { $ne: req.user._id } });
    res.send(users);
});

module.exports = { registerUser, authUser, allUsers };
