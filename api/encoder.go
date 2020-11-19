package api

import (
	"net/http"
	"strings"

	"github.com/labstack/echo"
)

const (
	// FormatJSON is the format constant for a JSON output
	FormatJSON = "json"
	// FormatJSONP is the format constant for a JSONP output
	FormatJSONP = "jsonp"
	// FormatXML is the format constant for a XML output
	FormatXML = "xml"
)

var (
	// ErrMissingCallback is thrown when the request is missing the
	// callback queryparam
	ErrMissingCallback = echo.NewHTTPError(http.StatusBadRequest,
		"Missing callback queryparam")
	// ErrUnsupportedFormat is thrown when the requestor has
	// defined an unsupported response format
	ErrUnsupportedFormat = echo.NewHTTPError(http.StatusBadRequest,
		"Unsupported format specified")
)

// FormatEncoder is an encoder that reads the format from the
// passed echo context and writes the status code and response
// based on that format on the URL
func FormatEncoder(c echo.Context, code int, res interface{}) error {
	// Add X-Powered-By header
	c.Response().Header().Add("X-Powered-By", "Trumail")

	// Encode the in requested format
	switch strings.ToLower(c.Param("format")) {
	case FormatXML:
		return c.XML(code, res)
	case FormatJSON:
		return c.JSON(code, res)
	case FormatJSONP:
		callback := c.QueryParam("callback")
		if callback == "" {
			return ErrMissingCallback
		}
		return c.JSONP(code, callback, res)
	default:
		return ErrUnsupportedFormat
	}
}
