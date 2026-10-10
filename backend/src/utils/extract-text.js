import pdf from 'pdf-parse';
import mammoth from 'mammoth';
import fs from 'fs/promises';

export const extractTextFromPDF = async (filePath) => {
  const dataBuffer = await fs.readFile(filePath);
  const data = await pdf(dataBuffer);
  return data.text;
};

export const extractTextFromDocx = async (filePath) => {
  const result = await mammoth.extractRawText({ path: filePath });
  return result.value;
};

export const extractText = async (filePath, mimeType) => {
  if (mimeType === 'application/pdf') {
    return await extractTextFromPDF(filePath);
  } else if (mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
    return await extractTextFromDocx(filePath);
  } else {
    throw new Error('Unsupported file type');
  }
};
