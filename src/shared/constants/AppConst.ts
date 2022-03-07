import {AuthUser} from '../../types/models/AuthUser';

export const authRole = {
  admin: ['admin'],
  user: ['user', 'admin'],
};

export enum RoutePermittedRole {
  Admin = 'admin',
  User = 'user',
}

export const initialUrl = '/dashboards/crypto'; // this url will open after login
