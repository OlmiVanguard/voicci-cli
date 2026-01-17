#!/usr/bin/env node

import React, { useState, useEffect } from 'react';
import { render, Box, Text } from 'ink';
import Queue from '../lib/queue.js';

const ProgressBar = ({ current, total, width = 30 }) => {
  const percent = total > 0 ? Math.round((current / total) * 100) : 0;
  const filled = Math.round((width * current) / total);
  const empty = width - filled;

  const bar = '█'.repeat(filled) + '░'.repeat(empty);

  return (
    <Box>
      <Text color="cyan">{bar}</Text>
      <Text> {percent}%</Text>
    </Box>
  );
};

const ChapterStatus = ({ chapter }) => {
  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return 'green';
      case 'processing':
        return 'yellow';
      case 'failed':
        return 'red';
      default:
        return 'gray';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed':
        return '✓';
      case 'processing':
        return '⋯';
      case 'failed':
        return '✗';
      default:
        return '○';
    }
  };

  return (
    <Box>
      <Text color={getStatusColor(chapter.status)}>
        {getStatusIcon(chapter.status)}
      </Text>
      <Text> Ch {chapter.chapter_num}: {chapter.title.substring(0, 50)}</Text>
    </Box>
  );
};

const ProgressUI = ({ jobId }) => {
  const [job, setJob] = useState(null);
  const [error, setError] = useState(null);
  const [queue] = useState(() => new Queue());

  useEffect(() => {
    const updateJob = () => {
      try {
        const jobData = queue.getJob(jobId);

        if (!jobData) {
          setError(`Job not found: ${jobId}`);
          return;
        }

        setJob(jobData);

        // Exit if job completed or failed
        if (jobData.status === 'completed' || jobData.status === 'failed') {
          setTimeout(() => {
            queue.close();
            process.exit(0);
          }, 3000);
        }
      } catch (err) {
        setError(err.message);
      }
    };

    // Initial update
    updateJob();

    // Poll every second
    const interval = setInterval(updateJob, 1000);

    return () => {
      clearInterval(interval);
    };
  }, [jobId, queue]);

  if (error) {
    return (
      <Box flexDirection="column">
        <Text color="red">Error: {error}</Text>
      </Box>
    );
  }

  if (!job) {
    return (
      <Box flexDirection="column">
        <Text color="yellow">Loading...</Text>
      </Box>
    );
  }

  const progress = job.total_chapters > 0
    ? (job.completed_chapters / job.total_chapters)
    : 0;

  return (
    <Box flexDirection="column" padding={1}>
      <Box marginBottom={1}>
        <Text bold color="cyan">
          🎧 {job.title}
        </Text>
      </Box>

      <Box marginBottom={1}>
        <Text>Status: </Text>
        <Text color={job.status === 'completed' ? 'green' : 'yellow'}>
          {job.status}
        </Text>
      </Box>

      <Box marginBottom={1} flexDirection="column">
        <Text>Overall Progress:</Text>
        <ProgressBar
          current={job.completed_chapters}
          total={job.total_chapters}
          width={50}
        />
        <Text color="gray">
          {job.completed_chapters} / {job.total_chapters} chapters
        </Text>
      </Box>

      <Box marginBottom={1} marginTop={1}>
        <Text bold>Chapters:</Text>
      </Box>

      <Box flexDirection="column">
        {job.chapters && job.chapters.map((chapter) => (
          <ChapterStatus key={chapter.id} chapter={chapter} />
        ))}
      </Box>

      {job.status === 'completed' && (
        <Box marginTop={1}>
          <Text color="green" bold>
            ✓ Audiobook completed!
          </Text>
        </Box>
      )}

      {job.status === 'failed' && (
        <Box marginTop={1} flexDirection="column">
          <Text color="red" bold>
            ✗ Job failed
          </Text>
          {job.error && <Text color="red">{job.error}</Text>}
        </Box>
      )}

      {job.output_dir && (
        <Box marginTop={1}>
          <Text color="gray">Output: {job.output_dir}</Text>
        </Box>
      )}

      <Box marginTop={1}>
        <Text color="gray" dimColor>
          Press Ctrl+C to exit (job continues in background)
        </Text>
      </Box>
    </Box>
  );
};

export default function renderProgressUI(jobId) {
  return new Promise((resolve) => {
    const { waitUntilExit } = render(<ProgressUI jobId={jobId} />);
    waitUntilExit().then(resolve);
  });
}
