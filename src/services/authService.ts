// src/services/authService.ts

import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

interface TokenPayload {
  id: number;
  email: string;
  role: string;
}

export class AuthService {
  private static readonly JWT_SECRET = process.env.JWT_SECRET;
  private static readonly JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN;

  static generateToken(payload: TokenPayload): string {
    
    // 1. Verificação de Segurança (Prova para o TypeScript que não é undefined)
    if (!this.JWT_SECRET) {
      throw new Error('JWT_SECRET não foi definida nas variáveis de ambiente.');
    }

    // 2. Definimos o 'expiresIn' com um fallback seguro
    const expiresIn = this.JWT_EXPIRES_IN || '24h';

    // 3. Objeto de Opções com TIPO EXPLÍCITO
    const options: jwt.SignOptions = {
        // 4. CORREÇÃO FINAL: Usamos 'as any'
        // Isso força o TypeScript a aceitar o nosso 'string' ('24h')
        // e resolve o erro "Type 'string' is not assignable to 'StringValue'".
        expiresIn: expiresIn as any, 
    };

    // 5. Chamada da função
    return jwt.sign(payload, this.JWT_SECRET, options);
  }

  static verifyToken(token: string): TokenPayload | null {
    try {
      // 6. Mesma verificação de segurança para 'verify'
      if (!this.JWT_SECRET) {
        throw new Error('JWT_SECRET não foi definida.');
      }

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