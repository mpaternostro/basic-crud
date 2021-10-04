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

  @Column({ unique: true })
  username: string;

  @Exclude()
  @Column({ select: false })
  password: string;

  @Exclude()
  @Column({
    type: 'varchar',
    nullable: true,
  })
  currentHashedRefreshToken: string | null;

  @CreateDateColumn({ type: dbType })
  createdAt: Date;

  @UpdateDateColumn({ type: dbType })
  updatedAt: Date;

  @OneToMany(() => Todo, (todo) => todo.user)
  todos: Todo[] | null;
}
