import { Exclude } from 'class-transformer';
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
  ColumnType,
} from 'typeorm';
import { Todo } from 'todo/entities/todo.entity';

function resolveDbType(): ColumnType {
  const isTestEnv = process.env.NODE_ENV === 'test';
  return isTestEnv ? 'datetime' : 'timestamptz';
}

const dbType = resolveDbType();

@Entity()
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  username: string;

  @Exclude()
  @Column()
  password: string;

  @CreateDateColumn({ type: dbType })
  createdAt: Date;

  @UpdateDateColumn({ type: dbType })
  updatedAt: Date;

  @OneToMany(() => Todo, (todo) => todo.id)
  todos: Todo[] | null;
}
