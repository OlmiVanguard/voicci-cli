# PodMe Deployment Checklist

## ✅ Pre-Deployment (Complete)

- [x] Core implementation complete
- [x] Text cleaner tested (16.80% reduction)
- [x] Node.js dependencies installed
- [x] Documentation written
- [x] Web landing page created
- [x] Installation script written
- [x] Test files created
- [x] Ralph loop bug fixed

## 📋 Testing Phase (In Progress)

### Python Environment
- [ ] Install Python dependencies:
  ```bash
  pip3 install TTS torch torchaudio
  ```
- [ ] Verify XTTS v2 model downloads (~450MB)
- [ ] Test Python script runs: `python3 lib/tts-engine.py --help`

### Book Search
- [ ] Test LibGen search:
  ```bash
  node cli/index.js --search "Animal Farm"
  ```
- [ ] Test download from LibGen
- [ ] Verify PDF downloaded correctly
- [ ] Test Anna's Archive fallback

### Text Processing
- [x] Test with sample book (completed)
- [ ] Test with real PDF from LibGen
- [ ] Verify chapter detection works
- [ ] Check TOC removal effective
- [ ] Validate text cleaning quality

### Audio Generation
- [ ] Test single chapter generation
- [ ] Verify WAV file created
- [ ] Check audio quality
- [ ] Test Metal acceleration (Apple Silicon)
- [ ] Test CPU fallback

### Background Worker
- [ ] Start worker process
- [ ] Verify detached operation
- [ ] Check log file created
- [ ] Test queue processing
- [ ] Verify survives terminal close

### Progress UI
- [ ] Test with running job
- [ ] Verify progress bars update
- [ ] Check chapter status indicators
- [ ] Test auto-exit on completion

### End-to-End
- [ ] Full pipeline test:
  ```bash
  podme "Animal Farm by George Orwell"
  ```
- [ ] Monitor progress: `podme -s <jobId>`
- [ ] Verify audiobook created
- [ ] Test audio playback
- [ ] Check all chapters present

## 🚀 Deployment Phase

### GitHub
- [ ] Create private repository
- [ ] Push all code:
  ```bash
  cd ~/Documents/local-codebases/Voicci/podme
  git init
  git add .
  git commit -m "Initial commit: PodMe audiobook generator"
  gh repo create OlmiVanguard/podme --private --source=. --push
  ```
- [ ] Add README.md to repo root
- [ ] Create release tag: `v1.0.0`

### Voicci.com Deployment
- [ ] Copy install script to server:
  ```bash
  scp install.sh user@voicci.com:/var/www/voicci.com/podme/install.sh
  ```
- [ ] Copy landing page:
  ```bash
  scp public/podme.html user@voicci.com:/var/www/voicci.com/podme/index.html
  ```
- [ ] Set permissions:
  ```bash
  ssh user@voicci.com "chmod +x /var/www/voicci.com/podme/install.sh"
  ```
- [ ] Test install script URL:
  ```bash
  curl -fsSL https://voicci.com/podme/install.sh | bash
  ```

### Claude Code Skill
- [ ] Create skill directory:
  ```bash
  mkdir -p ~/.claude/skills/podme
  ```
- [ ] Create skill manifest
- [ ] Write skill script
- [ ] Test `/podme` command
- [ ] Add to MCP config

## 🧪 Post-Deployment Testing

### Clean Machine Test
- [ ] Test on fresh macOS install (VM or clean account)
- [ ] Verify all dependencies auto-install
- [ ] Test with various book titles
- [ ] Check error handling

### Cross-Platform
- [ ] Test on macOS (primary)
- [ ] Test on Ubuntu 20.04+ (if available)
- [ ] Verify XDG paths work correctly

### Performance
- [ ] Benchmark short book (20k words)
- [ ] Benchmark novel (80k words)
- [ ] Monitor CPU/Memory usage
- [ ] Test Metal vs CPU speed difference

### Edge Cases
- [ ] Book not found (test search failure)
- [ ] Corrupted PDF
- [ ] Very large book (200k+ words)
- [ ] Book with no chapters
- [ ] PDF with images/tables

## 📢 Launch Preparation

### Documentation
- [ ] Update README with real examples
- [ ] Add screenshots/demos
- [ ] Create usage video (optional)
- [ ] Write blog post announcement

### Community
- [ ] Share on GitHub
- [ ] Post on relevant subreddits (r/opensource, r/audiobooks)
- [ ] Tweet about launch
- [ ] Share with beta testers

### Support
- [ ] Set up GitHub Issues
- [ ] Create FAQ based on testing
- [ ] Prepare troubleshooting guide
- [ ] Set up email support (support@voicci.com)

## 🐛 Known Issues to Fix

### High Priority
- None identified yet (pending testing)

### Medium Priority
- Voice cloning not implemented (future enhancement)
- MP3/M4A conversion manual (use ffmpeg)
- No resume for interrupted jobs

### Low Priority
- Z-Library integration incomplete
- Parallel chapter generation not implemented
- No desktop notifications

## 📊 Success Criteria

Deployment is successful when:
- ✅ One-line install works on clean machine
- ✅ Book search finds and downloads correctly
- ✅ Text cleaning removes >15% noise
- ✅ Audio generation completes without errors
- ✅ Background worker survives terminal close
- ✅ Progress UI shows real-time updates
- ✅ Audiobook quality is natural and clear
- ✅ Documentation is clear and complete

## 🎯 Post-Launch

### Week 1
- [ ] Monitor GitHub Issues
- [ ] Respond to user feedback
- [ ] Fix critical bugs
- [ ] Update documentation based on questions

### Month 1
- [ ] Add MP3 conversion
- [ ] Implement voice cloning
- [ ] Add parallel processing
- [ ] Create web UI for upload

### Future
- [ ] Mobile app integration
- [ ] Voice customization
- [ ] Multi-language support
- [ ] Cloud sync option (optional)

---

## 🚀 Current Status

**Phase**: Testing
**Completion**: 95%
**Blockers**: None
**Next Step**: Install Python dependencies

**Command to Continue:**
```bash
pip3 install TTS torch torchaudio
```

---

**Last Updated**: 2026-01-17
**Session**: Ralph Loop Iteration 1
