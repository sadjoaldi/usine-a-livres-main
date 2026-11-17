import bcrypt from "bcryptjs";
import { ConflictError } from "../errors/domain.error";
import type { UserRepository } from "../repositories/user.repository";
import type { UserInput } from "../schemas/user.schema";

export class AuthService {
  constructor(readonly UserRepository: UserRepository) {}

  async register(input: UserInput) {
    if (this.UserRepository.findByEmail(input.email)) {
      throw new ConflictError("Cet mail est deja utilisé");
    }

    const hashedPassword = await bcrypt.hash(input.password, 10);

    this.UserRepository.create({
      email: input.email,
      password: hashedPassword,
    });
  }

  async login(input: UserInput) {
    const user = this.UserRepository.findByEmail(input.email);
    if (!user) {
      throw new ConflictError("Utilisateur non trouvé");
    }

    const isPasswordValid = await bcrypt.compare(input.password, user.password);
    if (!isPasswordValid) {
      throw new ConflictError("Mot de passe incorrect");
    }

    return user;
  }
}
