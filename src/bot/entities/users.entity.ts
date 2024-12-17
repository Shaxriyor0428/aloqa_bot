import { Column, Entity, PrimaryColumn } from "typeorm";

@Entity("users")
export class Users {
  @PrimaryColumn({ type: "bigint" })
  id: number;

  @Column({ nullable: true })
  f_name: string;

  @Column({ nullable: true })
  l_name: string;

  @Column({ nullable: true })
  phone_number: string;

  @Column({ nullable: true })
  department_id: number;

  @Column({ nullable: true })
  last_state: string;
}
