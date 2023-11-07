import { Bytes, BigInt } from '@graphprotocol/graph-ts';

export const strip0x = (bytes: Bytes): string => {
  return bytes.toHexString().substring(2);
};

export const padTo32BytesEnd = (bytes: Bytes): Bytes => {
  const padded = bytes
    .toHexString()
    .substring(2)
    .padEnd(64, '0');
  return Bytes.fromHexString(padded);
};

export const padTo32BytesStart = (bytes: Bytes): Bytes => {
  const padded = bytes
    .toHexString()
    .substring(2)
    .padStart(64, '0');
  return Bytes.fromHexString(padded);
};

export const padHexStringToEven = (hexString: string): string => {
  const stripped = hexString.substring(2);
  const padded = stripped.length % 2 === 0 ? stripped : '0' + stripped;
  return `0x${padded}`;
};

export const padHexString = (hexString: string, byteLength: number): string => {
  const stripped = hexString.substring(2);
  const padded = stripped.padStart(<i32>(byteLength * 2), '0');
  return `0x${padded}`;
};

/**
 * Reverse in an endian-friendly way.
 */
export const reverseBytes = (bytes: Bytes): Bytes => {
  return Bytes.fromUint8Array(
    Bytes.fromHexString(bytes.toHexString()).reverse(),
  );
};

export const bigIntToBytes = (bigint: BigInt): Bytes => {
  return Bytes.fromUint8Array(
    Bytes.fromHexString(padHexStringToEven(bigint.toHexString())),
  );
};

export const reversedBytesToBigInt = (bytes: Bytes): BigInt => {
  return BigInt.fromUnsignedBytes(reverseBytes(bytes));
};
