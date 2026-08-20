import { Buffer } from "buffer";
import { startLandingFlow } from "./landing/startLandingFlow";

const globalWithBuffer = globalThis as typeof globalThis & {
  Buffer?: typeof Buffer;
};

if (!globalWithBuffer.Buffer) {
  globalWithBuffer.Buffer = Buffer;
}

startLandingFlow();
