import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
  ColumnType,
} from 'typeorm';
import { User } from 'user/entities/user.entity';

function resolveDbType(): ColumnType {
  const isTestEnv = process.env.NODE_ENV === 'test';
  return isTestEnv ? 'datetime' : 'timestamptz';
}

const dbType = resolveDbType();

@Entity()
export class Todo {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  title: string;

  @Column({ default: false })
  isCompleted: boolean;

  @CreateDateColumn({ type: dbType })
  createdAt: Date;

  @UpdateDateColumn({ type: dbType })
  updatedAt: Date;

  @ManyToOne(() => User, (user) => user.todos)
  user: User;
}
