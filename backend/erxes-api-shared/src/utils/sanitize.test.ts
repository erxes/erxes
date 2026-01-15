import { sanitizeFilename, sanitizeKey } from './sanitize';

describe('sanitize utilities', () => {
  describe('sanitizeFilename', () => {
    describe('valid filenames', () => {
      it('should return a valid filename unchanged', () => {
        expect(sanitizeFilename('document.txt')).toBe('document.txt');
        expect(sanitizeFilename('my-file.pdf')).toBe('my-file.pdf');
        expect(sanitizeFilename('report_2024.docx')).toBe('report_2024.docx');
      });

      it('should handle filenames with spaces', () => {
        expect(sanitizeFilename('my document.txt')).toBe('my document.txt');
        expect(sanitizeFilename('sales report.pdf')).toBe('sales report.pdf');
      });

      it('should handle filenames with dots in the middle', () => {
        expect(sanitizeFilename('file.backup.tar.gz')).toBe(
          'file.backup.tar.gz',
        );
        expect(sanitizeFilename('version.1.2.3.txt')).toBe('version.1.2.3.txt');
      });

      it('should handle Unicode characters', () => {
        expect(sanitizeFilename('文档.txt')).toBe('文档.txt');
        expect(sanitizeFilename('документ.pdf')).toBe('документ.pdf');
        expect(sanitizeFilename('café-résumé.doc')).toBe('café-résumé.doc');
      });

      it('should handle emoji and grapheme clusters', () => {
        expect(sanitizeFilename('file😀.txt')).toBe('file😀.txt');
        expect(sanitizeFilename('👨‍👩‍👧‍👦family.jpg')).toBe('👨‍👩‍👧‍👦family.jpg');
        expect(sanitizeFilename('🇺🇸flag.png')).toBe('🇺🇸flag.png');
      });
    });

    describe('illegal characters', () => {
      it('should remove forward slashes', () => {
        expect(sanitizeFilename('path/to/file.txt')).toBe('pathtofile.txt');
        expect(sanitizeFilename('a/b/c.doc')).toBe('abc.doc');
      });

      it('should remove backslashes', () => {
        expect(sanitizeFilename('path\\to\\file.txt')).toBe('pathtofile.txt');
        expect(sanitizeFilename('C:\\Documents\\file.doc')).toBe(
          'CDocumentsfile.doc',
        );
      });

      it('should remove question marks', () => {
        expect(sanitizeFilename('what?.txt')).toBe('what.txt');
        expect(sanitizeFilename('file?name.doc')).toBe('filename.doc');
      });

      it('should remove asterisks', () => {
        expect(sanitizeFilename('file*.txt')).toBe('file.txt');
        expect(sanitizeFilename('**important**.doc')).toBe('important.doc');
      });

      it('should remove colons', () => {
        expect(sanitizeFilename('file:name.txt')).toBe('filename.txt');
        expect(sanitizeFilename('time:12:30.log')).toBe('time1230.log');
      });

      it('should remove angle brackets', () => {
        expect(sanitizeFilename('<file>.txt')).toBe('file.txt');
        expect(sanitizeFilename('a<b>c.doc')).toBe('abc.doc');
      });

      it('should remove pipes', () => {
        expect(sanitizeFilename('file|name.txt')).toBe('filename.txt');
        expect(sanitizeFilename('a|b|c.doc')).toBe('abc.doc');
      });

      it('should remove double quotes', () => {
        expect(sanitizeFilename('"quoted".txt')).toBe('quoted.txt');
        expect(sanitizeFilename('file"name.doc')).toBe('filename.doc');
      });

      it('should remove multiple illegal characters at once', () => {
        expect(sanitizeFilename('file<>:"/\\|?*.txt')).toBe('file.txt');
        expect(sanitizeFilename('***???<<<>>>.doc')).toBe('.doc');
      });
    });

    describe('control characters', () => {
      it('should remove null bytes', () => {
        expect(sanitizeFilename('file\x00name.txt')).toBe('filename.txt');
      });

      it('should remove control characters (0x00-0x1f)', () => {
        expect(sanitizeFilename('file\x01\x02\x03.txt')).toBe('file.txt');
        expect(sanitizeFilename('test\x1f.doc')).toBe('test.doc');
      });

      it('should remove control characters (0x80-0x9f)', () => {
        expect(sanitizeFilename('file\x80\x9f.txt')).toBe('file.txt');
      });

      it('should remove newlines and tabs', () => {
        expect(sanitizeFilename('file\nname.txt')).toBe('filename.txt');
        expect(sanitizeFilename('file\tname.txt')).toBe('filename.txt');
        expect(sanitizeFilename('file\r\nname.txt')).toBe('filename.txt');
      });
    });

    describe('reserved names', () => {
      it('should remove dot-only names', () => {
        expect(sanitizeFilename('.')).toBe('');
        expect(sanitizeFilename('..')).toBe('');
        expect(sanitizeFilename('...')).toBe('');
        expect(sanitizeFilename('....')).toBe('');
      });

      it('should allow names that start with dots but have other characters', () => {
        expect(sanitizeFilename('.gitignore')).toBe('.gitignore');
        expect(sanitizeFilename('..config')).toBe('..config');
        expect(sanitizeFilename('.env.local')).toBe('.env.local');
      });
    });

    describe('Windows reserved names', () => {
      it('should remove CON and variants', () => {
        expect(sanitizeFilename('CON')).toBe('');
        expect(sanitizeFilename('con')).toBe('');
        expect(sanitizeFilename('CoN')).toBe('');
        expect(sanitizeFilename('CON.txt')).toBe('');
      });

      it('should remove PRN and variants', () => {
        expect(sanitizeFilename('PRN')).toBe('');
        expect(sanitizeFilename('prn')).toBe('');
        expect(sanitizeFilename('PRN.doc')).toBe('');
      });

      it('should remove AUX and variants', () => {
        expect(sanitizeFilename('AUX')).toBe('');
        expect(sanitizeFilename('aux')).toBe('');
        expect(sanitizeFilename('AUX.log')).toBe('');
      });

      it('should remove NUL and variants', () => {
        expect(sanitizeFilename('NUL')).toBe('');
        expect(sanitizeFilename('nul')).toBe('');
        expect(sanitizeFilename('NUL.txt')).toBe('');
      });

      it('should remove COM[0-9] and variants', () => {
        expect(sanitizeFilename('COM1')).toBe('');
        expect(sanitizeFilename('com2')).toBe('');
        expect(sanitizeFilename('COM9.txt')).toBe('');
      });

      it('should remove LPT[0-9] and variants', () => {
        expect(sanitizeFilename('LPT1')).toBe('');
        expect(sanitizeFilename('lpt5')).toBe('');
        expect(sanitizeFilename('LPT9.doc')).toBe('');
      });

      it('should allow names that contain but do not match reserved names', () => {
        expect(sanitizeFilename('CONOR.txt')).toBe('CONOR.txt');
        expect(sanitizeFilename('myPRN.doc')).toBe('myPRN.doc');
        expect(sanitizeFilename('COM10.txt')).toBe('COM10.txt');
        expect(sanitizeFilename('LPT10.doc')).toBe('LPT10.doc');
      });
    });

    describe('trailing spaces and dots', () => {
      it('should remove trailing spaces', () => {
        expect(sanitizeFilename('filename.txt ')).toBe('filename.txt');
        expect(sanitizeFilename('file.doc  ')).toBe('file.doc');
        expect(sanitizeFilename('test.pdf   ')).toBe('test.pdf');
      });

      it('should remove trailing dots', () => {
        expect(sanitizeFilename('filename.txt.')).toBe('filename.txt');
        expect(sanitizeFilename('file.doc..')).toBe('file.doc');
        expect(sanitizeFilename('test.pdf...')).toBe('test.pdf');
      });

      it('should remove trailing spaces and dots together', () => {
        expect(sanitizeFilename('filename.txt. ')).toBe('filename.txt');
        expect(sanitizeFilename('file.doc . .')).toBe('file.doc');
        expect(sanitizeFilename('test.pdf..  .  ')).toBe('test.pdf');
      });

      it('should handle filenames that are only spaces and dots', () => {
        expect(sanitizeFilename('  ')).toBe('');
        expect(sanitizeFilename('. .')).toBe('');
        expect(sanitizeFilename(' . . ')).toBe('');
      });
    });

    describe('length truncation', () => {
      it('should truncate filenames longer than 255 graphemes', () => {
        const longName = 'a'.repeat(300) + '.txt';
        const result = sanitizeFilename(longName);
        // Count graphemes using Intl.Segmenter
        const segmenter = new (Intl as any).Segmenter(undefined, {
          granularity: 'grapheme',
        });
        const graphemes = Array.from(
          segmenter.segment(result),
          ({ segment }: any) => segment,
        );
        expect(graphemes.length).toBe(255);
      });

      it('should truncate at grapheme boundaries for emoji', () => {
        // Create a string with 260 emoji
        const longEmoji = '😀'.repeat(260);
        const result = sanitizeFilename(longEmoji);
        const segmenter = new (Intl as any).Segmenter(undefined, {
          granularity: 'grapheme',
        });
        const graphemes = Array.from(
          segmenter.segment(result),
          ({ segment }: any) => segment,
        );
        expect(graphemes.length).toBe(255);
        // Ensure no broken emoji (each emoji should be complete)
        graphemes.forEach((g: string) => {
          expect(g).toMatch(/😀/);
        });
      });

      it('should handle complex grapheme clusters in truncation', () => {
        // Family emoji is a single grapheme cluster
        const familyEmoji = '👨‍👩‍👧‍👦';
        const longString = familyEmoji.repeat(260);
        const result = sanitizeFilename(longString);
        const segmenter = new (Intl as any).Segmenter(undefined, {
          granularity: 'grapheme',
        });
        const graphemes = Array.from(
          segmenter.segment(result),
          ({ segment }: any) => segment,
        );
        expect(graphemes.length).toBe(255);
      });

      it('should not truncate filenames under 255 graphemes', () => {
        const normalName = 'a'.repeat(200) + '.txt';
        expect(sanitizeFilename(normalName)).toBe(normalName);
      });
    });

    describe('edge cases', () => {
      it('should handle empty strings', () => {
        expect(sanitizeFilename('')).toBe('');
      });

      it('should throw error for non-string inputs', () => {
        expect(() => sanitizeFilename(null as any)).toThrow('Input must be string');
        expect(() => sanitizeFilename(undefined as any)).toThrow(
          'Input must be string',
        );
        expect(() => sanitizeFilename(123 as any)).toThrow('Input must be string');
        expect(() => sanitizeFilename({} as any)).toThrow('Input must be string');
        expect(() => sanitizeFilename([] as any)).toThrow('Input must be string');
      });

      it('should handle filenames with only illegal characters', () => {
        expect(sanitizeFilename('???***|||')).toBe('');
        expect(sanitizeFilename('<>:"/\\|?*')).toBe('');
      });

      it('should handle combination of all sanitization rules', () => {
        // Illegal chars + control chars + trailing spaces/dots + Windows reserved
        expect(sanitizeFilename('CO<N|>?.txt\x00. ')).toBe('');
        expect(
          sanitizeFilename('file<>:"/\\|?*\x01\x02\x03name.doc. '),
        ).toBe('filename.doc');
      });
    });
  });

  describe('sanitizeKey', () => {
    describe('valid keys', () => {
      it('should return valid alphanumeric keys unchanged', () => {
        expect(sanitizeKey('file123')).toBe('file123');
        expect(sanitizeKey('document')).toBe('document');
        expect(sanitizeKey('ABC123xyz')).toBe('ABC123xyz');
      });

      it('should allow keys with forward slashes', () => {
        expect(sanitizeKey('folder/file')).toBe('folder/file');
        expect(sanitizeKey('path/to/document')).toBe('path/to/document');
        expect(sanitizeKey('a/b/c/d')).toBe('a/b/c/d');
      });

      it('should allow keys with underscores', () => {
        expect(sanitizeKey('my_file')).toBe('my_file');
        expect(sanitizeKey('user_data_2024')).toBe('user_data_2024');
      });

      it('should allow keys with dashes', () => {
        expect(sanitizeKey('my-file')).toBe('my-file');
        expect(sanitizeKey('user-data-2024')).toBe('user-data-2024');
      });

      it('should allow keys with spaces', () => {
        expect(sanitizeKey('my file')).toBe('my file');
        expect(sanitizeKey('user data 2024')).toBe('user data 2024');
      });

      it('should allow keys with dots', () => {
        expect(sanitizeKey('file.txt')).toBe('file.txt');
        expect(sanitizeKey('document.backup.tar.gz')).toBe(
          'document.backup.tar.gz',
        );
      });

      it('should allow keys with parentheses', () => {
        expect(sanitizeKey('file(1)')).toBe('file(1)');
        expect(sanitizeKey('document (copy)')).toBe('document (copy)');
      });

      it('should allow combination of allowed characters', () => {
        expect(sanitizeKey('path/to/my-file_v2.0 (backup).txt')).toBe(
          'path/to/my-file_v2.0 (backup).txt',
        );
      });
    });

    describe('normalization', () => {
      it('should normalize redundant slashes', () => {
        expect(sanitizeKey('path//to///file')).toBe('path/to/file');
        expect(sanitizeKey('a////b')).toBe('a/b');
      });

      it('should normalize dot segments', () => {
        expect(sanitizeKey('path/./to/./file')).toBe('path/to/file');
        expect(sanitizeKey('a/./b/./c')).toBe('a/b/c');
      });

      it('should normalize multiple leading slashes', () => {
        expect(sanitizeKey('/path/to/file')).toBe('/path/to/file');
        expect(sanitizeKey('//file')).toBe('/file');
      });

      it('should keep single trailing slash after normalization', () => {
        expect(sanitizeKey('path/to/file/')).toBe('path/to/file/');
        expect(sanitizeKey('file///')).toBe('file/');
      });

      it('should handle complex normalization with leading/trailing slashes', () => {
        expect(sanitizeKey('//path/./to///file//')).toBe('/path/to/file/');
      });
    });

    describe('empty keys', () => {
      it('should throw error for empty string', () => {
        expect(() => sanitizeKey('')).toThrow('Key cannot be empty');
      });

      it('should throw error for null', () => {
        expect(() => sanitizeKey(null as any)).toThrow('Key cannot be empty');
      });

      it('should throw error for undefined', () => {
        expect(() => sanitizeKey(undefined as any)).toThrow(
          'Key cannot be empty',
        );
      });
    });

    describe('protocol schemes', () => {
      it('should throw error for http protocol', () => {
        expect(() => sanitizeKey('http://example.com')).toThrow(
          'Invalid key: protocol scheme not allowed',
        );
        expect(() => sanitizeKey('http://file')).toThrow(
          'Invalid key: protocol scheme not allowed',
        );
      });

      it('should throw error for https protocol', () => {
        expect(() => sanitizeKey('https://example.com')).toThrow(
          'Invalid key: protocol scheme not allowed',
        );
        expect(() => sanitizeKey('https://secure.site')).toThrow(
          'Invalid key: protocol scheme not allowed',
        );
      });

      it('should throw error for case-insensitive protocols', () => {
        expect(() => sanitizeKey('HTTP://example.com')).toThrow(
          'Invalid key: protocol scheme not allowed',
        );
        expect(() => sanitizeKey('HtTpS://example.com')).toThrow(
          'Invalid key: protocol scheme not allowed',
        );
        expect(() => sanitizeKey('HTTPS://example.com')).toThrow(
          'Invalid key: protocol scheme not allowed',
        );
      });

      it('should allow text containing http/https as part of name', () => {
        expect(sanitizeKey('http_config')).toBe('http_config');
        expect(sanitizeKey('https_enabled')).toBe('https_enabled');
        expect(sanitizeKey('myhttpsfile')).toBe('myhttpsfile');
      });
    });

    describe('path traversal', () => {
      it('should throw error for double dots', () => {
        expect(() => sanitizeKey('../file')).toThrow(
          'Invalid key: path traversal is not allowed',
        );
        expect(() => sanitizeKey('path/../file')).toThrow(
          'Invalid key: path traversal is not allowed',
        );
        expect(() => sanitizeKey('../../etc/passwd')).toThrow(
          'Invalid key: path traversal is not allowed',
        );
      });

      it('should throw error for path traversal patterns', () => {
        expect(() => sanitizeKey('path/to/../../etc')).toThrow(
          'Invalid key: path traversal is not allowed',
        );
      });

      it('should throw error for keys with multiple dot dot patterns', () => {
        expect(() => sanitizeKey('a/../..')).toThrow(
          'Invalid key: path traversal is not allowed',
        );
      });

      it('should allow keys with "dot dot" in filenames', () => {
        // Note: This should fail the initial check
        expect(() => sanitizeKey('file..txt')).toThrow(
          'Invalid key: path traversal is not allowed',
        );
      });
    });

    describe('disallowed characters', () => {
      it('should throw error for special characters', () => {
        expect(() => sanitizeKey('file@name')).toThrow(
          'Invalid key: contains disallowed characters',
        );
        expect(() => sanitizeKey('file#name')).toThrow(
          'Invalid key: contains disallowed characters',
        );
        expect(() => sanitizeKey('file$name')).toThrow(
          'Invalid key: contains disallowed characters',
        );
        expect(() => sanitizeKey('file%name')).toThrow(
          'Invalid key: contains disallowed characters',
        );
      });

      it('should throw error for brackets and braces', () => {
        expect(() => sanitizeKey('file[name]')).toThrow(
          'Invalid key: contains disallowed characters',
        );
        expect(() => sanitizeKey('file{name}')).toThrow(
          'Invalid key: contains disallowed characters',
        );
      });

      it('should throw error for angle brackets', () => {
        expect(() => sanitizeKey('file<name>')).toThrow(
          'Invalid key: contains disallowed characters',
        );
      });

      it('should throw error for quotes', () => {
        expect(() => sanitizeKey("file'name")).toThrow(
          'Invalid key: contains disallowed characters',
        );
        expect(() => sanitizeKey('file"name')).toThrow(
          'Invalid key: contains disallowed characters',
        );
        expect(() => sanitizeKey('file`name')).toThrow(
          'Invalid key: contains disallowed characters',
        );
      });

      it('should throw error for backslash', () => {
        expect(() => sanitizeKey('path\\to\\file')).toThrow(
          'Invalid key: contains disallowed characters',
        );
      });

      it('should throw error for pipe and ampersand', () => {
        expect(() => sanitizeKey('file|name')).toThrow(
          'Invalid key: contains disallowed characters',
        );
        expect(() => sanitizeKey('file&name')).toThrow(
          'Invalid key: contains disallowed characters',
        );
      });

      it('should throw error for semicolon and colon', () => {
        expect(() => sanitizeKey('file;name')).toThrow(
          'Invalid key: contains disallowed characters',
        );
        expect(() => sanitizeKey('file:name')).toThrow(
          'Invalid key: contains disallowed characters',
        );
      });

      it('should throw error for question mark and asterisk', () => {
        expect(() => sanitizeKey('file?name')).toThrow(
          'Invalid key: contains disallowed characters',
        );
        expect(() => sanitizeKey('file*name')).toThrow(
          'Invalid key: contains disallowed characters',
        );
      });

      it('should throw error for Unicode characters', () => {
        expect(() => sanitizeKey('文档')).toThrow(
          'Invalid key: contains disallowed characters',
        );
        expect(() => sanitizeKey('café')).toThrow(
          'Invalid key: contains disallowed characters',
        );
      });

      it('should throw error for emoji', () => {
        expect(() => sanitizeKey('file😀')).toThrow(
          'Invalid key: contains disallowed characters',
        );
      });
    });

    describe('edge cases', () => {
      it('should handle keys with allowed special characters', () => {
        expect(sanitizeKey('---___.   ()()')).toBe('---___.   ()()');
        expect(sanitizeKey('file-name_test')).toBe('file-name_test');
      });

      it('should handle single character keys', () => {
        expect(sanitizeKey('a')).toBe('a');
        expect(sanitizeKey('1')).toBe('1');
        expect(sanitizeKey('_')).toBe('_');
      });

      it('should handle very long valid keys', () => {
        const longKey = 'a'.repeat(1000);
        expect(sanitizeKey(longKey)).toBe(longKey);
      });

      it('should handle root slash normalization', () => {
        // path.posix.normalize('/') returns '/'
        expect(sanitizeKey('/')).toBe('/');
      });

      it('should reject multiple path traversal attempts', () => {
        expect(() => sanitizeKey('../../../etc/passwd')).toThrow(
          'Invalid key: path traversal is not allowed',
        );
        expect(() => sanitizeKey('a/../../b')).toThrow(
          'Invalid key: path traversal is not allowed',
        );
      });
    });

    describe('security tests', () => {
      it('should prevent accessing parent directories', () => {
        expect(() => sanitizeKey('../')).toThrow();
        expect(() => sanitizeKey('..')).toThrow();
        expect(() => sanitizeKey('a/..')).toThrow();
      });

      it('should prevent URL-encoded path traversal', () => {
        // The function doesn't decode URL encoding, so these would be rejected
        // for having invalid characters (%)
        expect(() => sanitizeKey('%2e%2e%2f')).toThrow(
          'Invalid key: contains disallowed characters',
        );
      });

      it('should prevent null byte injection', () => {
        expect(() => sanitizeKey('file\x00name')).toThrow(
          'Invalid key: contains disallowed characters',
        );
      });

      it('should prevent command injection attempts', () => {
        expect(() => sanitizeKey('file; rm -rf /')).toThrow(
          'Invalid key: contains disallowed characters',
        );
        expect(() => sanitizeKey('file && malicious')).toThrow(
          'Invalid key: contains disallowed characters',
        );
        expect(() => sanitizeKey('file | cat /etc/passwd')).toThrow(
          'Invalid key: contains disallowed characters',
        );
      });

      it('should prevent various injection patterns', () => {
        expect(() => sanitizeKey('$(whoami)')).toThrow(
          'Invalid key: contains disallowed characters',
        );
        expect(() => sanitizeKey('`whoami`')).toThrow(
          'Invalid key: contains disallowed characters',
        );
      });
    });
  });
});
