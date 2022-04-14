
/*
 * -------------------------------------------------------
 * THIS FILE WAS AUTOMATICALLY GENERATED (DO NOT MODIFY)
 * -------------------------------------------------------
 */

/* tslint:disable */
/* eslint-disable */
export class CreateTodoInput {
    title: string;
}

export class UpdateTodoInput {
    id: string;
    title?: Nullable<string>;
    isCompleted?: Nullable<boolean>;
}

export class CreateUserInput {
    username: string;
    password: string;
}

export class UpdateUserInput {
    id: string;
    currentPassword: string;
    username?: Nullable<string>;
    password?: Nullable<string>;
}

export class RemoveUserInput {
    id: string;
    currentPassword: string;
}

export class Todo {
    id: string;
    title: string;
    isCompleted: boolean;
    user: User;
    createdAt: DateTime;
    updatedAt: DateTime;
}

export abstract class IQuery {
    abstract todos(): Todo[] | Promise<Todo[]>;

    abstract todo(id: string): Todo | Promise<Todo>;

    abstract whoAmI(): User | Promise<User>;

    abstract users(): User[] | Promise<User[]>;

    abstract user(id: string): User | Promise<User>;
}

export abstract class IMutation {
    abstract createTodo(createTodoInput: CreateTodoInput): Todo | Promise<Todo>;

    abstract updateTodo(updateTodoInput: UpdateTodoInput): Todo | Promise<Todo>;

    abstract removeTodo(id: string): Todo | Promise<Todo>;

    abstract createUser(createUserInput: CreateUserInput): User | Promise<User>;

    abstract updateUser(updateUserInput: UpdateUserInput): User | Promise<User>;

    abstract removeUser(removeUserInput: RemoveUserInput): User | Promise<User>;
}

export class User {
    id: string;
    username: string;
    password?: Nullable<string>;
    currentHashedRefreshToken?: Nullable<string>;
    todos?: Nullable<Todo[]>;
    createdAt: DateTime;
    updatedAt: DateTime;
}

export type DateTime = Date;
type Nullable<T> = T | null;
