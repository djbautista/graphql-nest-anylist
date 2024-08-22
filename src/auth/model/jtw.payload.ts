export default interface JwtPayload {
  sub: string;
  name: string;
  iat: number;
  exp: number;
}
