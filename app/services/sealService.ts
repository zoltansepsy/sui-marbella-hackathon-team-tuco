import { SuiClient } from "@mysten/sui/client";
import { getFullnodeUrl } from "@mysten/sui/client";
import { SealClient, SessionKey } from "@mysten/seal";
import { Transaction } from "@mysten/sui/transactions";
import { fromHex } from "@mysten/sui/utils";

export interface SealConfig {
  network?: "testnet" | "mainnet";
  serverObjectIds?: string[];
  whitelistPackageId?: string;
}

/**
 * Seal Service for encryption/decryption with whitelist access control
 * Based on: https://seal-docs.wal.app/Design/ and https://seal-docs.wal.app/UsingSeal/
 * Whitelist pattern: https://github.com/MystenLabs/seal/blob/main/move/patterns/sources/whitelist.move
 */
export class SealService {
  private client: SealClient;
  private suiClient: SuiClient;
  private whitelistPackageId: string;

  constructor(config?: SealConfig) {
    const network = config?.network || "testnet";
    this.suiClient = new SuiClient({ url: getFullnodeUrl(network) });

    // Default Seal key server object IDs for testnet
    const serverObjectIds = config?.serverObjectIds || [
      "0x73d05d62c18d9374e3ea529e8e0ed6161da1a141a94d3f76ae3fe4e99356db75",
      "0xf5d14a81a982144ae441cd7d64b09027f116a468bd36e7eca494f750591623c8",
    ];

    this.client = new SealClient({
      suiClient: this.suiClient,
      serverConfigs: serverObjectIds.map((id) => ({
        objectId: id,
        weight: 1,
      })),
      verifyKeyServers: false,
    });

    // Whitelist package ID - replace with your deployed whitelist package ID
    this.whitelistPackageId =
      config?.whitelistPackageId || "YOUR_WHITELIST_PACKAGE_ID";
  }

  /**
   * Encrypt data using Seal with whitelist access control
   * The ID format for whitelist: [packageId][whitelistObjectId][nonce]
   * Seal automatically prepends the packageId, so we pass [whitelistObjectId][nonce]
   * Based on whitelist.move: check_policy uses wl.id.to_bytes() as prefix
   * @param whitelistObjectId - The whitelist object ID (hex string)
   * @param nonce - Random nonce for this encryption
   * @param data - Data to encrypt
   * @returns Encrypted bytes and backup key
   */
  async encrypt(
    whitelistObjectId: string,
    nonce: string,
    data: Uint8Array,
  ): Promise<{ encryptedBytes: Uint8Array; backupKey: Uint8Array }> {
    // Construct the ID: [whitelistObjectId][nonce] as bytes
    // Seal prepends packageId automatically
    // The Move code checks: wl.id.to_bytes() as prefix, so we use the object ID
    const cleanWhitelistObjectId = whitelistObjectId.startsWith("0x")
      ? whitelistObjectId.slice(2)
      : whitelistObjectId;

    // Convert whitelist object ID (hex) and nonce (string) to bytes
    const whitelistObjectIdBytes = fromHex(cleanWhitelistObjectId);
    const nonceBytes = new TextEncoder().encode(nonce);
    const idBytes = new Uint8Array([...whitelistObjectIdBytes, ...nonceBytes]);

    // Convert to hex string for Seal SDK
    const id = Array.from(idBytes)
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");

    const { encryptedObject: encryptedBytes, key: backupKey } =
      await this.client.encrypt({
        threshold: 1,
        packageId: this.whitelistPackageId,
        id: id,
        data,
      });

    return { encryptedBytes, backupKey };
  }

  /**
   * Create a session key for the user
   * The user must sign the personal message with their wallet
   * @param address - User's Sui address
   * @param signPersonalMessage - Function to sign personal message (from wallet)
   * @returns Session key
   */
  async createSessionKey(
    address: string,
    signPersonalMessage: (message: Uint8Array) => Promise<string>,
  ): Promise<SessionKey> {
    const sessionKey = await SessionKey.create({
      address: address,
      packageId: this.whitelistPackageId,
      ttlMin: 10, // TTL of 10 minutes
      suiClient: this.suiClient,
    });

    const message = sessionKey.getPersonalMessage();
    const signature = await signPersonalMessage(message);
    sessionKey.setPersonalMessageSignature(signature);

    return sessionKey;
  }

  /**
   * Decrypt data using Seal with whitelist access control
   * @param encryptedBytes - Encrypted data
   * @param sessionKey - User's session key
   * @param whitelistObjectId - The whitelist object ID (hex string)
   * @param nonce - Nonce used during encryption
   * @returns Decrypted bytes
   */
  async decrypt(
    encryptedBytes: Uint8Array,
    sessionKey: SessionKey,
    whitelistObjectId: string,
    nonce: string,
  ): Promise<Uint8Array> {
    // Construct the ID used during encryption (same as in encrypt)
    // [whitelistObjectId][nonce] as bytes
    const cleanWhitelistObjectId = whitelistObjectId.startsWith("0x")
      ? whitelistObjectId.slice(2)
      : whitelistObjectId;

    // Convert whitelist object ID (hex) and nonce (string) to bytes
    const whitelistObjectIdBytes = fromHex(cleanWhitelistObjectId);
    const nonceBytes = new TextEncoder().encode(nonce);
    const idBytes = new Uint8Array([...whitelistObjectIdBytes, ...nonceBytes]);

    // Create the Transaction for evaluating the seal_approve function
    // Based on whitelist.move: entry fun seal_approve(id: vector<u8>, wl: &Whitelist, ctx: &TxContext)
    // Module: startHack::whitelist (package ID will be used)
    const tx = new Transaction();
    tx.moveCall({
      target: `${this.whitelistPackageId}::whitelist::seal_approve`,
      arguments: [
        tx.pure.vector("u8", Array.from(idBytes)),
        tx.object(whitelistObjectId), // Whitelist shared object
      ],
    });

    const txBytes = (await tx.build({
      client: this.suiClient,
      onlyTransactionKind: true,
    })) as any;

    const decryptedBytes = await this.client.decrypt({
      data: encryptedBytes,
      sessionKey,
      txBytes,
    });

    return decryptedBytes;
  }

  /**
   * Get the Sui client
   */
  getSuiClient(): SuiClient {
    return this.suiClient;
  }

  /**
   * Get the whitelist package ID
   */
  getWhitelistPackageId(): string {
    return this.whitelistPackageId;
  }
}

/**
 * Factory function to create SealService
 */
export function createSealService(config?: SealConfig): SealService {
  return new SealService(config);
}
