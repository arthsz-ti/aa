// src/services/authService.ts

import jwt, { Secret } from 'jsonwebtoken'; // Importe 'Secret' aqui
import bcrypt from 'bcryptjs';

interface TokenPayload {
  id: number;
  email: string;
  role: string;
}

export class AuthService {
  // 1. Correção do JWT_SECRET: Tipamos como 'Secret' (deve ser string ou Buffer)
  // Usamos 'as Secret' na atribuição para garantir ao TypeScript que o valor será
  // uma string (ou definimos um fallback string, como feito)
  private static readonly JWT_SECRET: Secret = process.env.JWT_SECRET || 'secret-key';
  
  // 2. Correção do JWT_EXPIRES_IN: Manter como string e garantir valor padrão
  private static readonly JWT_EXPIRES_IN: string = process.env.JWT_EXPIRES_IN || '24h';

  static generateToken(payload: TokenPayload): string {
    return jwt.sign(
      payload,
      this.JWT_SECRET, // O tipo 'Secret' está correto e não precisa de asserção 'as string'
      {
        // 3. Correção do expiresIn: Usamos 'as string' aqui para resolver o erro
        // da sobrecarga de função do TypeScript, pois o valor vem do 'process.env'.
        expiresIn: this.JWT_EXPIRES_IN as string,
      }
    );
  }

  static verifyToken(token: string): TokenPayload | null {
    try {
      // Também adicionamos uma asserção 'as Secret' ou 'as string' aqui
      // se process.env.JWT_SECRET for usado diretamente na propriedade estática
      const decoded = jwt.verify(token, this.JWT_SECRET) as TokenPayload;
      return decoded;
    } catch (error) {
      return null;
    }
  }

  static async hashPassword(password: string): Promise<string> {
    const salt = await bcrypt.genSalt(10);
    return bcrypt.hash(password, salt);
  }

  static async comparePassword(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }
}