// eslint-disable-next-line @typescript-eslint/no-unused-vars
export default function assertUnreachable(_: never): never {
  throw new Error("Didn't expect to get here");
}
