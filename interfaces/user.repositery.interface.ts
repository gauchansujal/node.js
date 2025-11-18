import { User, UserDocument } from '../types/user.type';

export interface UserRepositoryInterface {
    createUser(user: User): Promise<UserDocument>;
    getUser(): Promise<UserDocument[]>;
}
