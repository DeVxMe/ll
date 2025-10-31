export const IDL = {
  version: "0.1.0",
  name: "soldrive",
  address: "CxDoRt3Nt5z747KNW6vkVxvQQ7c2dHMmGmoWNmxejA3f",
  metadata: {
    name: "soldrive",
    version: "0.1.0",
    spec: "0.1.0"
  },
  instructions: [
    {
      name: "helloSoldrive",
      accounts: [],
      args: []
    },
    {
      name: "initialize",
      accounts: [
        {
          name: "config",
          isMut: true,
          isSigner: false
        },
        {
          name: "authority",
          isMut: true,
          isSigner: true
        },
        {
          name: "systemProgram",
          isMut: false,
          isSigner: false
        }
      ],
      args: []
    },
    {
      name: "createUserProfile",
      accounts: [
        {
          name: "userProfile",
          isMut: true,
          isSigner: false
        },
        {
          name: "user",
          isMut: true,
          isSigner: true
        },
        {
          name: "systemProgram",
          isMut: false,
          isSigner: false
        }
      ],
      args: []
    },
    {
      name: "createFile",
      accounts: [
        {
          name: "fileRecord",
          isMut: true,
          isSigner: false
        },
        {
          name: "config",
          isMut: true,
          isSigner: false
        },
        {
          name: "userProfile",
          isMut: true,
          isSigner: false
        },
        {
          name: "owner",
          isMut: true,
          isSigner: true
        },
        {
          name: "systemProgram",
          isMut: false,
          isSigner: false
        }
      ],
      args: [
        {
          name: "fileName",
          type: "string"
        },
        {
          name: "fileSize",
          type: "u64"
        },
        {
          name: "fileHash",
          type: {
            array: ["u8", 32]
          }
        },
        {
          name: "chunkCount",
          type: "u32"
        },
        {
          name: "timestamp",
          type: "i64"
        }
      ]
    },
    {
      name: "registerStorage",
      accounts: [
        {
          name: "fileRecord",
          isMut: true,
          isSigner: false
        },
        {
          name: "owner",
          isMut: false,
          isSigner: true
        }
      ],
      args: [
        {
          name: "primaryStorage",
          type: "string"
        },
        {
          name: "merkleRoot",
          type: {
            array: ["u8", 32]
          }
        }
      ]
    },
    {
      name: "finalizeFile",
      accounts: [
        {
          name: "fileRecord",
          isMut: true,
          isSigner: false
        },
        {
          name: "owner",
          isMut: false,
          isSigner: true
        }
      ],
      args: []
    },
    {
      name: "grantAccess",
      accounts: [
        {
          name: "sharedAccess",
          isMut: true,
          isSigner: false
        },
        {
          name: "fileRecord",
          isMut: false,
          isSigner: false
        },
        {
          name: "owner",
          isMut: true,
          isSigner: true
        },
        {
          name: "systemProgram",
          isMut: false,
          isSigner: false
        }
      ],
      args: [
        {
          name: "sharedWith",
          type: "publicKey"
        },
        {
          name: "accessLevel",
          type: {
            defined: "AccessLevel"
          }
        },
        {
          name: "expiresAt",
          type: {
            option: "i64"
          }
        }
      ]
    },
    {
      name: "revokeAccess",
      accounts: [
        {
          name: "sharedAccess",
          isMut: true,
          isSigner: false
        },
        {
          name: "fileRecord",
          isMut: false,
          isSigner: false
        },
        {
          name: "owner",
          isMut: false,
          isSigner: true
        }
      ],
      args: []
    },
    {
      name: "makePublic",
      accounts: [
        {
          name: "fileRecord",
          isMut: true,
          isSigner: false
        },
        {
          name: "owner",
          isMut: false,
          isSigner: true
        }
      ],
      args: []
    },
    {
      name: "makePrivate",
      accounts: [
        {
          name: "fileRecord",
          isMut: true,
          isSigner: false
        },
        {
          name: "owner",
          isMut: false,
          isSigner: true
        }
      ],
      args: []
    }
  ],
  accounts: [
    {
      name: "SolDriveConfig",
      type: {
        kind: "struct",
        fields: [
          {
            name: "authority",
            type: "publicKey"
          },
          {
            name: "totalFiles",
            type: "u64"
          },
          {
            name: "storageFeePerGb",
            type: "u64"
          },
          {
            name: "maxFileSize",
            type: "u64"
          }
        ]
      }
    },
    {
      name: "UserProfile",
      type: {
        kind: "struct",
        fields: [
          {
            name: "owner",
            type: "publicKey"
          },
          {
            name: "filesOwned",
            type: "u64"
          },
          {
            name: "storageUsed",
            type: "u64"
          },
          {
            name: "storagePaidUntil",
            type: "i64"
          },
          {
            name: "reputationScore",
            type: "u32"
          }
        ]
      }
    },
    {
      name: "FileRecord",
      type: {
        kind: "struct",
        fields: [
          {
            name: "owner",
            type: "publicKey"
          },
          {
            name: "fileName",
            type: "string"
          },
          {
            name: "fileSize",
            type: "u64"
          },
          {
            name: "fileHash",
            type: {
              array: ["u8", 32]
            }
          },
          {
            name: "chunkCount",
            type: "u32"
          },
          {
            name: "merkleRoot",
            type: {
              array: ["u8", 32]
            }
          },
          {
            name: "primaryStorage",
            type: "string"
          },
          {
            name: "createdAt",
            type: "i64"
          },
          {
            name: "updatedAt",
            type: "i64"
          },
          {
            name: "status",
            type: {
              defined: "FileStatus"
            }
          },
          {
            name: "isPublic",
            type: "bool"
          }
        ]
      }
    },
    {
      name: "SharedAccess",
      type: {
        kind: "struct",
        fields: [
          {
            name: "fileRecord",
            type: "publicKey"
          },
          {
            name: "owner",
            type: "publicKey"
          },
          {
            name: "sharedWith",
            type: "publicKey"
          },
          {
            name: "accessLevel",
            type: {
              defined: "AccessLevel"
            }
          },
          {
            name: "expiresAt",
            type: {
              option: "i64"
            }
          },
          {
            name: "createdAt",
            type: "i64"
          },
          {
            name: "isActive",
            type: "bool"
          }
        ]
      }
    }
  ],
  types: [
    {
      name: "AccessLevel",
      type: {
        kind: "enum",
        variants: [
          {
            name: "Read"
          },
          {
            name: "Write"
          },
          {
            name: "Admin"
          }
        ]
      }
    },
    {
      name: "FileStatus",
      type: {
        kind: "enum",
        variants: [
          {
            name: "Uploading"
          },
          {
            name: "Processing"
          },
          {
            name: "Active"
          },
          {
            name: "Archived"
          },
          {
            name: "Deleted"
          }
        ]
      }
    }
  ],
  errors: [
    {
      code: 6000,
      name: "FileNameTooLong",
      msg: "File name is too long (max 50 characters)"
    },
    {
      code: 6001,
      name: "InvalidFileSize",
      msg: "Invalid file size"
    },
    {
      code: 6002,
      name: "InvalidChunkCount",
      msg: "Invalid chunk count"
    },
    {
      code: 6003,
      name: "StorageLocationTooLong",
      msg: "Storage location string is too long (max 100 characters)"
    },
    {
      code: 6004,
      name: "StorageLocationEmpty",
      msg: "Storage location cannot be empty"
    },
    {
      code: 6005,
      name: "InvalidFileStatus",
      msg: "Invalid file status for this operation"
    },
    {
      code: 6006,
      name: "NoStorageLocation",
      msg: "No storage location registered"
    },
    {
      code: 6007,
      name: "FileNotActive",
      msg: "File must be active to share"
    },
    {
      code: 6008,
      name: "InvalidExpirationTime",
      msg: "Expiration time must be in the future"
    }
  ]
};
