import { describe, it, expect } from "vitest";
import { BackendService } from "../../src/services/backendService";

describe("BackendService", () => {
  it("should be defined", () => {
    expect(BackendService).toBeDefined();
  });

  // Note: Currently BackendService is available as we're using InternetIdentityService directly
  // Add tests here when actual backend methods are implemented
});
