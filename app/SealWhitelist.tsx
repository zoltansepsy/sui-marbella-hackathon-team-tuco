"use client";
import { useState, useMemo } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useCurrentAccount, useSuiClient, useWallets } from "@mysten/dapp-kit";
import { createSealService } from "./services";
import ClipLoader from "react-spinners/ClipLoader";
import { SessionKey } from "@mysten/seal";
import { TESTNET_WHITELIST_PACKAGE_ID } from "./constants";

interface EncryptedItem {
  encryptedBytes: Uint8Array;
  backupKey: Uint8Array;
  whitelistObjectId: string;
  nonce: string;
  originalData: string;
  timestamp: number;
}

export function SealWhitelist() {
  const currentAccount = useCurrentAccount();
  const suiClient = useSuiClient();
  const wallets = useWallets();

  // Create seal service
  const sealService = useMemo(() => {
    if (typeof window === "undefined") {
      return null as any;
    }
    return createSealService({
      network: "testnet",
      whitelistPackageId: TESTNET_WHITELIST_PACKAGE_ID,
    });
  }, []);

  const [whitelistObjectId, setWhitelistObjectId] = useState("");
  const [nonce, setNonce] = useState("");
  const [textToEncrypt, setTextToEncrypt] = useState("");
  const [sessionKey, setSessionKey] = useState<SessionKey | null>(null);
  const [encryptedItems, setEncryptedItems] = useState<EncryptedItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  /**
   * Sign personal message using wallet
   */
  const signPersonalMessage = async (message: Uint8Array): Promise<string> => {
    if (!currentAccount || !wallets.length) {
      throw new Error("Please connect your wallet first");
    }

    const connectedWallet = wallets.find((w) =>
      w.accounts.find((acc) => acc.address === currentAccount.address),
    );

    if (!connectedWallet) {
      throw new Error("Wallet not found");
    }

    const account = connectedWallet.accounts.find(
      (acc) => acc.address === currentAccount.address,
    );

    if (!account) {
      throw new Error("Account not found");
    }

    // Use the wallet's signPersonalMessage feature
    const signer = connectedWallet.features["sui:signPersonalMessage"];
    if (!signer) {
      throw new Error("Wallet does not support signPersonalMessage");
    }

    const result = await signer.signPersonalMessage({
      message: message,
      account: account,
    });

    return result.signature;
  };

  /**
   * Create session key with wallet signing
   */
  const handleCreateSessionKey = async () => {
    if (!currentAccount) {
      setError("Please connect your wallet first");
      return;
    }

    if (!sealService) {
      setError("Seal service not available. Please refresh the page.");
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const key = await sealService.createSessionKey(
        currentAccount.address,
        signPersonalMessage,
      );
      setSessionKey(key);
      setSuccess("Session key created successfully! Valid for 10 minutes.");
    } catch (err) {
      setError(
        `Failed to create session key: ${
          err instanceof Error ? err.message : "Unknown error"
        }`,
      );
      console.error("Session key creation error:", err);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Encrypt data using Seal
   */
  const handleEncrypt = async () => {
    if (!textToEncrypt.trim()) {
      setError("Please enter text to encrypt");
      return;
    }

    if (!whitelistObjectId.trim()) {
      setError("Please enter whitelist object ID");
      return;
    }

    if (!sealService) {
      setError("Seal service not available. Please refresh the page.");
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      // Generate random nonce if not provided
      const encryptionNonce = nonce.trim() || crypto.randomUUID();

      // Convert text to bytes
      const data = new TextEncoder().encode(textToEncrypt);

      // Encrypt using Seal
      const { encryptedBytes, backupKey } = await sealService.encrypt(
        whitelistObjectId,
        encryptionNonce,
        data,
      );

      const encryptedItem: EncryptedItem = {
        encryptedBytes,
        backupKey,
        whitelistObjectId,
        nonce: encryptionNonce,
        originalData: textToEncrypt,
        timestamp: Date.now(),
      };

      setEncryptedItems([encryptedItem, ...encryptedItems]);
      setSuccess("Data encrypted successfully!");
      setTextToEncrypt("");
      setNonce("");
    } catch (err) {
      setError(
        `Encryption failed: ${
          err instanceof Error ? err.message : "Unknown error"
        }`,
      );
      console.error("Encryption error:", err);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Decrypt data using Seal
   */
  const handleDecrypt = async (item: EncryptedItem) => {
    if (!sessionKey) {
      setError("Please create a session key first");
      return;
    }

    if (!sealService) {
      setError("Seal service not available. Please refresh the page.");
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      // Decrypt using Seal
      const decryptedBytes = await sealService.decrypt(
        item.encryptedBytes,
        sessionKey,
        item.whitelistObjectId,
        item.nonce,
      );

      // Convert bytes to text
      const decryptedText = new TextDecoder().decode(decryptedBytes);

      setSuccess(`Decrypted: ${decryptedText}`);
    } catch (err) {
      setError(
        `Decryption failed: ${
          err instanceof Error ? err.message : "Unknown error"
        }. Make sure you are on the whitelist.`,
      );
      console.error("Decryption error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <div className="space-y-6">
        {/* Header */}
        <Card>
          <CardHeader>
            <CardTitle className="text-3xl text-black">
              Seal Whitelist Encryption
            </CardTitle>
            <CardDescription className="text-black">
              Encrypt and decrypt data using Seal with whitelist access control.
              Only addresses on the whitelist can decrypt the data.
            </CardDescription>
          </CardHeader>
        </Card>

        {/* Status Messages */}
        {error && (
          <Alert variant="destructive" className="bg-red-50 border-red-200">
            <AlertDescription className="text-red-900">
              {error}
            </AlertDescription>
          </Alert>
        )}

        {success && (
          <Alert className="bg-green-50 text-green-900 border-green-200">
            <AlertDescription className="text-green-900">
              {success}
            </AlertDescription>
          </Alert>
        )}

        {/* Session Key Section */}
        <Card>
          <CardHeader>
            <CardTitle className="text-black">Session Key</CardTitle>
            <CardDescription className="text-black">
              Create a session key to decrypt data. You'll need to sign a
              message with your wallet. The session key is valid for 10 minutes.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="flex-1">
                  {sessionKey ? (
                    <div className="text-sm text-green-600 font-medium">
                      ✓ Session key active (valid for 10 minutes)
                    </div>
                  ) : (
                    <div className="text-sm text-gray-600">
                      No active session key
                    </div>
                  )}
                </div>
                <Button
                  onClick={handleCreateSessionKey}
                  disabled={loading || !!sessionKey}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  {loading ? (
                    <>
                      <ClipLoader size={20} color="white" className="mr-2" />
                      Creating...
                    </>
                  ) : (
                    "Create Session Key"
                  )}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Encryption Section */}
        <Card>
          <CardHeader>
            <CardTitle className="text-black">Encrypt Data</CardTitle>
            <CardDescription className="text-black">
              Encrypt data that can only be decrypted by addresses on the
              whitelist.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-black mb-2">
                  Whitelist Object ID
                </label>
                <input
                  type="text"
                  value={whitelistObjectId}
                  onChange={(e) => setWhitelistObjectId(e.target.value)}
                  placeholder="0x... (the whitelist shared object ID)"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black"
                />
                <p className="text-xs text-gray-600 mt-1">
                  The whitelist object ID created using create_whitelist_entry
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-black mb-2">
                  Nonce (optional - random UUID will be generated if empty)
                </label>
                <input
                  type="text"
                  value={nonce}
                  onChange={(e) => setNonce(e.target.value)}
                  placeholder="Leave empty for random nonce"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-black mb-2">
                  Text to Encrypt
                </label>
                <textarea
                  value={textToEncrypt}
                  onChange={(e) => setTextToEncrypt(e.target.value)}
                  placeholder="Enter text to encrypt..."
                  className="w-full h-32 p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none text-black placeholder:text-gray-500"
                />
              </div>
              <Button
                onClick={handleEncrypt}
                disabled={loading}
                className="w-full bg-green-600 hover:bg-green-700 text-white"
                size="lg"
              >
                {loading ? (
                  <>
                    <ClipLoader size={20} color="white" className="mr-2" />
                    Encrypting...
                  </>
                ) : (
                  "🔒 Encrypt Data"
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Encrypted Items History */}
        {encryptedItems.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-black">
                Encrypted Items ({encryptedItems.length})
              </CardTitle>
              <CardDescription className="text-black">
                Your encrypted data. Only whitelisted addresses can decrypt.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {encryptedItems.map((item, index) => (
                  <div
                    key={index}
                    className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                  >
                    <div className="space-y-2">
                      <div className="text-sm text-black">
                        <span className="font-medium">Original:</span>{" "}
                        {item.originalData}
                      </div>
                      <div className="text-xs text-gray-600">
                        <span className="font-medium">
                          Whitelist Object ID:
                        </span>{" "}
                        {item.whitelistObjectId.slice(0, 10)}... •{" "}
                        <span className="font-medium">Nonce:</span> {item.nonce}{" "}
                        • <span className="font-medium">Time:</span>{" "}
                        {new Date(item.timestamp).toLocaleTimeString()}
                      </div>
                      <div className="text-xs text-gray-600">
                        <span className="font-medium">Encrypted Size:</span>{" "}
                        {item.encryptedBytes.length} bytes
                      </div>
                    </div>
                    <div className="mt-3">
                      <Button
                        size="sm"
                        onClick={() => handleDecrypt(item)}
                        disabled={loading || !sessionKey}
                        className="bg-purple-600 hover:bg-purple-700 text-white"
                      >
                        {loading ? (
                          <>
                            <ClipLoader
                              size={16}
                              color="white"
                              className="mr-2"
                            />
                            Decrypting...
                          </>
                        ) : (
                          "🔓 Decrypt"
                        )}
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Info Card */}
        <Card className="bg-blue-50">
          <CardHeader>
            <CardTitle className="text-blue-900">
              ℹ️ About Seal Whitelist
            </CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-blue-900 space-y-2">
            <p>
              <strong>Seal</strong> uses Identity-Based Encryption (IBE) with
              whitelist access control.
            </p>
            <ul className="list-disc list-inside space-y-1 ml-4">
              <li>
                Only addresses on the whitelist can decrypt encrypted data
              </li>
              <li>
                Session keys allow decryption for 10 minutes without repeated
                wallet confirmations
              </li>
              <li>
                The encryption ID format: [packageId][whitelistObjectId][nonce]
              </li>
              <li>
                Access control is enforced on-chain through the whitelist Move
                module
              </li>
            </ul>
            <p className="mt-4">
              <strong>Documentation:</strong>{" "}
              <a
                href="https://seal-docs.wal.app/Design/"
                target="_blank"
                rel="noopener noreferrer"
                className="underline"
              >
                Seal Design
              </a>{" "}
              •{" "}
              <a
                href="https://seal-docs.wal.app/UsingSeal/"
                target="_blank"
                rel="noopener noreferrer"
                className="underline"
              >
                Using Seal
              </a>
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
