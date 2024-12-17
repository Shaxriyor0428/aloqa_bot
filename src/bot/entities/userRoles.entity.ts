import { Entity, PrimaryGeneratedColumn, Column } from "typeorm";

@Entity("user_roles")
export class UserRoles {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: "bigint" })
  user_id: number;

  @Column()
  role_id: number;
}
