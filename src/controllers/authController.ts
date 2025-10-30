import { Request, Response } from 'express';
import { AuthService } from '../services/authService';
import { AuthRequest } from '../middleware/authMiddleware';

interface LoginRequest {
  email: string;
  password: string;
}

interface RegisterRequest {
  name: string;
  email: string;
  password: string;
}

export class AuthController {
  private static users: Array<{
    id: number;
    name: string;
    email: string;
    password: string;
    role: string;
  }> = [
    {
      id: 1,
      name: 'Admin',
      email: 'admin@lobster.com',
      password: '$SantosFC',
      role: 'admin',
    },
  ];

  private static idCounter = 2;

  async login(req: Request, res: Response): Promise<Response> {
    try {
      const { email, password } = req.body as LoginRequest;

      if (!email || !password) {
        return res.status(400).json({ error: 'Email e senha são obrigatórios' });
      }

      const user = AuthController.users.find(u => u.email === email);
      if (!user) {
        return res.status(401).json({ error: 'Email ou senha inválidos' });
      }

      const isPasswordValid = await AuthService.comparePassword(password, user.password);
      if (!isPasswordValid) {
        return res.status(401).json({ error: 'Email ou senha inválidos' });
      }

      const token = AuthService.generateToken({
        id: user.id,
        email: user.email,
        role: user.role,
      });

      return res.json({
        message: 'Login realizado com sucesso',
        token,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
      });
    } catch (error) {
      return res.status(500).json({ error: 'Erro ao fazer login' });
    }
  }

  async register(req: Request, res: Response): Promise<Response> {
    try {
      const { name, email, password } = req.body as RegisterRequest;

      if (!name || !email || !password) {
        return res.status(400).json({ error: 'Nome, email e senha são obrigatórios' });
      }

      const existingUser = AuthController.users.find(u => u.email === email);
      if (existingUser) {
        return res.status(400).json({ error: 'Email já cadastrado' });
      }

      const hashedPassword = await AuthService.hashPassword(password);

      const newUser = {
        id: AuthController.idCounter++,
        name,
        email,
        password: hashedPassword,
        role: 'user',
      };

      AuthController.users.push(newUser);

      const token = AuthService.generateToken({
        id: newUser.id,
        email: newUser.email,
        role: newUser.role,
      });

      return res.status(201).json({
        message: 'Usuário registrado com sucesso',
        token,
        user: {
          id: newUser.id,
          name: newUser.name,
          email: newUser.email,
          role: newUser.role,
        },
      });
    } catch (error) {
      return res.status(500).json({ error: 'Erro ao registrar usuário' });
    }
  }

  async getCurrentUser(req: AuthRequest, res: Response): Promise<Response> {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'Usuário não autenticado' });
      }

      const user = AuthController.users.find(u => u.id === req.user!.id);
      if (!user) {
        return res.status(404).json({ error: 'Usuário não encontrado' });
      }

      return res.json({
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      });
    } catch (error) {
      return res.status(500).json({ error: 'Erro ao obter usuário' });
    }
  }
}
