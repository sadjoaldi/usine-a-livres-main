import type { UserRecord } from "../schemas/user.schema";

export interface UserRepository {
  findByEmail(email: string): UserRecord | undefined;
  findById(id: number): UserRecord | undefined;
  create(data: Omit<UserRecord, "id">): UserRecord;
}
