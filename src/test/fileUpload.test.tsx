import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { FileUpload } from '../components/upload/FileUpload';

describe('FileUpload Component Unit Tests', () => {
  it('displays category label, description, and accepted formats', () => {
    render(
      <FileUpload
        docType="salary_slips"
        label="Salary Slips"
        description="Last 3 months pay slips"
        files={[]}
        onFilesChange={() => {}}
      />
    );

    expect(screen.getByText(/Salary Slips/i)).toBeInTheDocument();
    expect(screen.getByText(/Last 3 months pay slips/i)).toBeInTheDocument();
    expect(screen.getByText(/PDF, JPG, or PNG/i)).toBeInTheDocument();
  });

  it('rejects unsupported file extensions with clear error message', async () => {
    render(
      <FileUpload
        docType="bank_statements"
        label="Bank Statements"
        acceptedFormats={['application/pdf']}
        files={[]}
        onFilesChange={() => {}}
      />
    );

    const input = document.querySelector('input[type="file"]') as HTMLInputElement;
    expect(input).toBeInTheDocument();

    // Create a mock executable or zip file
    const invalidFile = new File(['content'], 'archive.zip', { type: 'application/zip' });

    fireEvent.change(input, { target: { files: [invalidFile] } });

    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent(/Unsupported file type/i);
    });
  });

  it('supports custom render function pattern (Render Props Pattern)', () => {
    const customRender = vi.fn(({ files }: any) => (
      <div data-testid="custom-gallery">Custom Preview Count: {files.length}</div>
    ));

    render(
      <FileUpload
        docType="aadhaar_card"
        label="Aadhaar Card"
        files={[]}
        onFilesChange={() => {}}
      >
        {customRender}
      </FileUpload>
    );

    expect(screen.getByTestId('custom-gallery')).toHaveTextContent('Custom Preview Count: 0');
    expect(customRender).toHaveBeenCalled();
  });
});
