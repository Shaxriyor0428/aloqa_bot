import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from "typeorm";

@Entity("departments")
export class Department {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @ManyToOne(() => Department, (department) => department.id, {
    nullable: true,
  })
  @JoinColumn({ name: "parent_id" })
  parent: Department | null;

  @CreateDateColumn({ type: "timestamp" })
  created_at: Date;
}
