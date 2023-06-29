import { useEffect, useState } from 'react';
import axios from 'axios';

interface File {
  name: string;
  path: string;
  content?: string;
}

interface RepositoryPageProps {
  owner: string;
  repo: string;
  token: string;
}

const RepositoryPage: React.FC<RepositoryPageProps> = ({ owner, repo, token }) => {
  const [files, setFiles] = useState<File[]>([]);

  useEffect(() => {
    const fetchRepositoryFiles = async () => {
      try {
        const url = `https://api.github.com/repos/${owner}/${repo}/contents`;
        const headers = { Authorization: `Bearer ${token}` };
        const response = await axios.get<File[]>(url, { headers });

        if (response.status === 200) {
          const filesData = response.data;
          setFiles(filesData);
        } else {
          throw new Error('Failed to fetch repository files');
        }
      } catch (error) {
        console.error(error);
      }
    };

    fetchRepositoryFiles();
  }, [owner, repo, token]);

  useEffect(() => {
    const fetchFileContent = async (file: File) => {
      try {
        const url = `https://api.github.com/repos/${owner}/${repo}/contents/${file.path}`;
        const headers = { Authorization: `Bearer ${token}` };
        const response = await axios.get<{ content: string }>(url, { headers });

        if (response.status === 200) {
          const fileContent = atob(response.data.content);
          const updatedFile = { ...file, content: fileContent };
          setFiles((prevFiles) => {
            const updatedFiles = prevFiles.map((f) => (f.path === file.path ? updatedFile : f));
            return updatedFiles;
          });
        } else {
          throw new Error(`Failed to fetch content for file: ${file.path}`);
        }
      } catch (error) {
        console.error(error);
      }
    };

    files.forEach((file) => {
      if (!file.content) {
        fetchFileContent(file);
      }
    });
  }, [owner, repo, token, files]);

  return (
    <div>
      <h1>Lista dei file nella repository</h1>
      <ul>
        {files.map((file) => (
          <li key={file.path}>
            {file.name} - {file.content}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default RepositoryPage;