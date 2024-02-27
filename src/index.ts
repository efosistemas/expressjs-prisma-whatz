import { PrismaClient } from "@prisma/client";
import express from "express";
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());
app.use(express.raw({ type: "application/vnd.custom-type" }));
app.use(express.text({ type: "text/html" }));

// ======

app.get("/users", async (req, res) => {
  
  try {
    const users = await prisma.user.findMany({
      orderBy: { createdAt: "desc" },
    })
    const { password: _, ...usersList } = users
    res.json(usersList);
  } catch (error) {
      return res.status(500).json({ message: 'Internal Server Error' })
  }
});

app.post("/user", async (req, res) => {
  const {name,email,password} = req.body;
  if (!name) {
    return res.status(400).json({ message: 'O nome é obrigatório' })
  }  
  if (!email) {
    return res.status(400).json({ message: 'O e-mail é obrigatório' })
  }
  if (!email) {
    return res.status(400).json({ message: 'A senha é obrigatória' })
  }
  const userExists = await prisma.user.findFirst({where: {email: email}});
  if (!userExists) {
    return res.status(400).json({ message: 'e-mail já cadastrado' })
  }

  const hashPassword = await bcrypt.hash(password, 10)
  
  try {
    const newUser = await prisma.user.create({
      data: {
        name,
        email,
        password: hashPassword 
      },
    }); 
    const { password: _, ...user } = newUser

    return res.json(user);
  } catch (error) {
      return res.status(500).json({ message: 'Internal Server Error' })
  }
    
});


app.listen(Number(port), "0.0.0.0", () => {
    console.log(`Example app listening at http://localhost:${port}`);
});
