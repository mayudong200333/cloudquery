//go:build integration
// +build integration

package compute

import (
	"testing"

	"github.com/cloudquery/cq-provider-gcp/client"
)

func TestIntegrationComputeNetworks(t *testing.T) {
	client.GcpTestHelper(t, ComputeNetworks())
}
