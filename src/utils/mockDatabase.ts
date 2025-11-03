import { User } from "../types";

class MockDatabase {
   private users: Map<number, User>;
   private nextId: number = 4;

   constructor() {
      this.users = new Map([
         [1, { id: 1, name: "John Doe", email: "john@example.com" }],
         [2, { id: 2, name: "Jane Smith", email: "jane@example.com" }],
         [3, { id: 3, name: "Alice Johnson", email: "alice@example.com" }]
      ]);
   }

   getUser(id: number): User | null {
      return this.users.get(id) || null;
   }

   getAllUsers(): User[] {
      return Array.from(this.users.values());
   }

   createUser(name: string, email: string): User {
      const newUser: User = {
         id: this.nextId++,
         name,
         email
      };

      this.users.set(newUser.id, newUser);
      return newUser;
   }

   userExists(id: number): boolean {
      return this.users.has(id);
   }

   getUserCount(): number {
      return this.users.size;
   }
}

export const mockDatabase = new MockDatabase();
