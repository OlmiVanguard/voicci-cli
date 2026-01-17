# Voicci - Legal & Liability Review

## ✅ Safety Assessment

### What Voicci Is
- **Open-source CLI tool** (MIT License)
- **100% local processing** - No cloud, no APIs, no servers
- **User-controlled** - Runs on user's hardware with user's models
- **Text-to-speech converter** - Transforms text files to audio

### What Voicci Is NOT
- ❌ Not a book distribution service
- ❌ Not a hosting platform
- ❌ No central servers or APIs
- ❌ No user data collection
- ❌ No Voicci APIs or services included

---

## 🔒 Liability Protection Checklist

### ✅ No Voicci Infrastructure Used
- [x] No APIs included
- [x] No backend services
- [x] No authentication systems
- [x] No user accounts
- [x] No cloud storage
- [x] No data collection

**Status**: ✅ Voicci has ZERO infrastructure exposure

### ✅ User-Controlled Execution
- [x] Runs entirely on user's machine
- [x] Uses user's Python environment
- [x] Uses user's AI models (XTTS v2)
- [x] User provides input files
- [x] User decides what to process

**Status**: ✅ User has full control, Voicci does not process anything

### ✅ Open Source License (MIT)
- [x] MIT License includes disclaimer of warranties
- [x] Limits liability for software defects
- [x] Users accept terms by using software
- [x] No implied warranties of merchantability

**Status**: ✅ Standard open-source protection

---

## ⚠️ Copyright Concerns

### The Book Finder Feature
**Risk**: `lib/book-finder.js` searches LibGen, Anna's Archive for copyrighted books

**Legal Status**:
- Voicci **does not host** any copyrighted content
- Voicci **does not distribute** any copyrighted content
- Voicci is a **search tool** (like Google)
- Users are responsible for their downloads
- Torrenting/downloading is user's action, not Voicci's

**Similar Tools**:
- YouTube-DL: Downloads copyrighted videos, widely used, not held liable
- Popcorn Time: Torrent streaming, developers not prosecuted (servers were)
- Calibre: E-book manager, can download from various sources

**Key Legal Principle**:
> Tools that enable users to access content are generally not liable if:
> 1. The tool has substantial non-infringing uses
> 2. The tool does not host/distribute content
> 3. Users control what content they access

**Voicci's Non-Infringing Uses**:
- Converting personal documents (legal)
- Converting public domain books (legal)
- Converting academic papers (often legal under fair use)
- Converting user-written content (legal)
- Converting licensed e-books (legal)

---

## 🛡️ Recommended Legal Protections

### 1. Clear Terms of Service
```
By using Voicci, you agree:
- You are responsible for compliance with copyright laws
- You will only process content you have rights to
- You will not use Voicci to infringe on copyrights
- Voicci provides Voicci "as-is" with no warranties
- You indemnify Voicci for your use of the software
```

### 2. Prominent Disclaimers on Website
```
⚠️ COPYRIGHT NOTICE
Voicci is a tool for converting text to speech. Users are responsible
for ensuring they have the legal right to process any content.
Do not use Voicci to infringe on copyrights.
```

### 3. Remove Book Search from Default Install (Optional)
**Conservative approach**: Make book search an opt-in feature

```bash
# Default install: Text-to-speech only
npm install -g voicci

# Advanced install: Include book search
npm install -g voicci --with-book-search
```

**Or**: Keep book search but add explicit warning when used:
```
⚠️  You are searching for copyrighted content. Ensure you have
    the legal right to download and use this material in your
    jurisdiction. Voicci is not responsible for your downloads.

Continue? (y/N)
```

### 4. Geofencing (Optional but Cautious)
Some countries have stricter copyright laws:
- Germany: Very strict
- Japan: Criminal penalties for downloading
- US: DMCA but fair use protections

**Conservative**: Disable book search in strict jurisdictions
**Moderate**: Show country-specific warnings
**Liberal**: Rely on user responsibility (current approach)

---

## 📄 Recommended Landing Page Structure

### voicci.com/voicci-cli

```
┌─────────────────────────────────────────────┐
│  🎧 Voicci - AI Audiobook Generator          │
│  Transform text files into high-quality     │
│  audiobooks using local AI models           │
│                                             │
│  [Download for Mac] [Download for Linux]    │
│  [View on GitHub]                           │
└─────────────────────────────────────────────┘

⚠️ IMPORTANT LEGAL INFORMATION

Before installing, please read:

✓ WHAT VOICCI IS
  • Open-source text-to-speech converter
  • Runs 100% locally on your computer
  • No cloud services, no data collection
  • Uses your hardware and AI models

✓ SYSTEM REQUIREMENTS
  • macOS 12+ or Linux
  • 8GB RAM recommended (2GB minimum)
  • Python 3.9+
  • Node.js 18+
  • 10GB free disk space

✓ DEPENDENCIES INSTALLED
  • TTS (Python library for text-to-speech)
  • PyTorch (AI framework)
  • poppler-utils (for PDF processing)

✓ YOUR RESPONSIBILITY
  ⚠️ You are responsible for ensuring you have the legal
     right to process any content you use with Voicci.

  ⚠️ Do not use Voicci to infringe on copyrights.

  ⚠️ Voicci provides Voicci "as-is" with no warranties.

  ⚠️ By using Voicci, you agree to our Terms of Service.

✓ WHAT VOICCI DOES NOT DO
  • We do not host or distribute books
  • We do not collect your data
  • We do not process your files
  • We are not responsible for your use of the software

[ ] I understand and agree to the Terms of Service

[Install Voicci]
```

---

## 📋 Terms of Service (Short Version)

```markdown
# Voicci Terms of Service

Last Updated: 2026-01-17

## 1. Acceptance of Terms
By downloading, installing, or using Voicci, you agree to these terms.

## 2. Description of Service
Voicci is an open-source command-line tool that converts text files
to audio using AI text-to-speech technology. Voicci runs entirely on
your local computer.

## 3. User Responsibilities
You are solely responsible for:
- Ensuring you have legal rights to any content you process
- Compliance with copyright laws in your jurisdiction
- Your use of any optional features (e.g., content search)
- Any consequences of your use of Voicci

## 4. Prohibited Uses
You may not use Voicci to:
- Infringe on copyrights or intellectual property rights
- Violate any applicable laws or regulations
- Distribute copyrighted content without authorization

## 5. No Warranties
Voicci is provided "AS-IS" without any warranties, express or implied.
Voicci makes no guarantees about:
- Functionality or performance
- Accuracy of generated audio
- Availability or reliability
- Fitness for any particular purpose

## 6. Limitation of Liability
To the maximum extent permitted by law:
- Voicci is not liable for your use of Voicci
- Voicci is not liable for any content you process
- Voicci is not responsible for third-party content sources
- You indemnify Voicci against claims arising from your use

## 7. Open Source License
Voicci is licensed under the MIT License. See LICENSE file for details.

## 8. Third-Party Services
Voicci may provide tools to search for content on third-party websites.
Voicci does not control, endorse, or take responsibility for these
third-party services or the content available through them.

## 9. Modifications
Voicci may modify these terms at any time. Continued use after changes
constitutes acceptance of the new terms.

## 10. Governing Law
These terms are governed by the laws of [Your Jurisdiction].

## Contact
For questions: support@voicci.com
```

---

## 🎯 Recommended Approach

### Conservative (Lowest Risk)
1. ✅ Host on voicci.com/voicci-cli
2. ✅ Prominent legal disclaimers
3. ✅ Clear Terms of Service
4. ⚠️ **Remove book search feature** from default install
5. ✅ Make it opt-in for advanced users

### Moderate (Balanced)
1. ✅ Host on voicci.com/voicci-cli
2. ✅ Prominent legal disclaimers
3. ✅ Clear Terms of Service
4. ✅ Keep book search but add warning dialog
5. ✅ Require explicit consent before searching

### Liberal (Higher Risk but Common)
1. ✅ Host on voicci.com/voicci-cli
2. ✅ Standard legal disclaimers
3. ✅ Terms of Service
4. ✅ Book search included (like YouTube-DL)
5. ✅ Rely on user responsibility

**Recommendation**: **Moderate approach**
- Keeps full functionality
- Adds explicit warnings
- Clear user responsibility
- Industry-standard practice

---

## ✅ Final Checklist

### Legal Protection
- [x] MIT License (includes warranty disclaimer)
- [ ] Terms of Service on website
- [ ] Copyright warning in software
- [ ] User consent required
- [ ] Clear "as-is" disclaimers

### Technical Safety
- [x] No Voicci APIs included
- [x] 100% local execution
- [x] No user data collection
- [x] No central servers
- [x] Open source (auditable)

### Website Requirements
- [ ] System requirements listed
- [ ] Dependencies disclosed
- [ ] Legal disclaimers prominent
- [ ] Terms of Service acceptance
- [ ] Contact information provided

---

## 🎬 Next Steps

1. **Create landing page** at voicci.com/voicci-cli
2. **Add copyright warning** to book search feature
3. **Publish Terms of Service**
4. **Host installer script**
5. **Test legal disclaimer flow**

---

## 💼 Legal Opinion (Not Legal Advice)

**Bottom Line**: Voicci is similar to tools like YouTube-DL, Calibre, and
FFmpeg. These tools have substantial non-infringing uses and do not host
or distribute content. With proper disclaimers and user responsibility
clauses, liability risk is **low to moderate**.

**Recommended**: Consult with a lawyer familiar with:
- Software licensing (MIT)
- Copyright law (DMCA, fair use)
- User-generated content platforms

**Cost**: ~$500-1500 for legal review
**Worth it**: If expecting significant user base

---

## 📞 When to Seek Legal Counsel

Consult a lawyer if:
- You receive DMCA takedown notice
- User reports copyright infringement
- Scaling to 10K+ users
- Monetizing Voicci (ads, premium features)
- Expanding to other jurisdictions

Otherwise: Standard disclaimers are sufficient for open-source tool.

---

**Status**: ✅ Voicci can be safely hosted with proper disclaimers
**Risk Level**: 🟡 Low-Moderate (similar to YouTube-DL)
**Recommended Action**: Add Terms of Service + Copyright warnings
