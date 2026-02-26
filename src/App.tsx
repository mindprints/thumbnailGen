import { useState } from 'react';
import { GoogleGenAI } from '@google/genai';
import { Loader2, Image as ImageIcon, Calendar, MapPin, Users } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export default function App() {
  const [eventDescription, setEventDescription] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [thumbnailUrl, setThumbnailUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const generateThumbnail = async () => {
    if (!eventDescription.trim()) return;

    setIsGenerating(true);
    setError(null);
    setThumbnailUrl(null);

    try {
      const prompt = `A high-quality, aesthetic, and inviting thumbnail image for an event booking app. The event is: ${eventDescription}. The image should be vibrant, professional, and suitable for a modern app interface. No text in the image.`;

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: {
          parts: [
            {
              text: prompt,
            },
          ],
        },
        config: {
          imageConfig: {
            aspectRatio: "16:9",
          },
        },
      });

      let foundImage = false;
      for (const part of response.candidates?.[0]?.content?.parts || []) {
        if (part.inlineData) {
          const base64EncodeString = part.inlineData.data;
          const imageUrl = `data:${part.inlineData.mimeType || 'image/png'};base64,${base64EncodeString}`;
          setThumbnailUrl(imageUrl);
          foundImage = true;
          break;
        }
      }

      if (!foundImage) {
        throw new Error("No image was returned by the model.");
      }
    } catch (err: any) {
      console.error("Error generating thumbnail:", err);
      setError(err.message || "Failed to generate thumbnail. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="min-h-screen bg-neutral-50 text-neutral-900 font-sans selection:bg-indigo-100 selection:text-indigo-900">
      <div className="max-w-5xl mx-auto px-6 py-12 md:py-24">
        
        <header className="mb-12 text-center">
          <h1 className="text-4xl md:text-5xl font-semibold tracking-tight text-neutral-950 mb-4">
            Event Thumbnail Generator
          </h1>
          <p className="text-lg text-neutral-500 max-w-2xl mx-auto">
            Describe your event, and we'll generate a beautiful, bespoke thumbnail for your booking page using AI.
          </p>
        </header>

        <div className="grid md:grid-cols-2 gap-12 items-start">
          
          {/* Input Section */}
          <div className="bg-white p-8 rounded-3xl shadow-sm border border-neutral-100">
            <h2 className="text-xl font-medium mb-6 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-indigo-500" />
              Event Details
            </h2>
            
            <div className="space-y-6">
              <div>
                <label htmlFor="event-desc" className="block text-sm font-medium text-neutral-700 mb-2">
                  What's the event?
                </label>
                <textarea
                  id="event-desc"
                  rows={4}
                  className="w-full px-4 py-3 rounded-xl border border-neutral-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all resize-none"
                  placeholder="e.g., A weekend trip to Paris, Beers in the local pub, A sunny day at the beach..."
                  value={eventDescription}
                  onChange={(e) => setEventDescription(e.target.value)}
                />
              </div>

              <button
                onClick={generateThumbnail}
                disabled={isGenerating || !eventDescription.trim()}
                className="w-full bg-neutral-950 hover:bg-neutral-800 text-white font-medium py-3.5 px-6 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <ImageIcon className="w-5 h-5" />
                    Generate Thumbnail
                  </>
                )}
              </button>

              {error && (
                <div className="p-4 bg-red-50 text-red-600 rounded-xl text-sm">
                  {error}
                </div>
              )}
            </div>

            <div className="mt-8 pt-8 border-t border-neutral-100">
              <h3 className="text-sm font-medium text-neutral-400 uppercase tracking-wider mb-4">Try these examples</h3>
              <div className="flex flex-wrap gap-2">
                {['A weekend trip to Paris', 'Beers in the local pub', 'A sunny day at the beach', 'A round of golf at sunset'].map((example) => (
                  <button
                    key={example}
                    onClick={() => setEventDescription(example)}
                    className="text-sm px-3 py-1.5 bg-neutral-100 hover:bg-neutral-200 text-neutral-600 rounded-lg transition-colors"
                  >
                    {example}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Preview Section */}
          <div className="sticky top-12">
            <h2 className="text-xl font-medium mb-6 flex items-center gap-2 px-2">
              <ImageIcon className="w-5 h-5 text-indigo-500" />
              Preview
            </h2>
            
            <div className="bg-white rounded-3xl shadow-md border border-neutral-100 overflow-hidden group">
              <div className="aspect-video bg-neutral-100 relative overflow-hidden">
                <AnimatePresence mode="wait">
                  {isGenerating ? (
                    <motion.div
                      key="loading"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="absolute inset-0 flex flex-col items-center justify-center bg-neutral-100 text-neutral-400"
                    >
                      <Loader2 className="w-8 h-8 animate-spin mb-3 text-indigo-500" />
                      <span className="text-sm font-medium animate-pulse">Crafting your image...</span>
                    </motion.div>
                  ) : thumbnailUrl ? (
                    <motion.div
                      key="image"
                      initial={{ opacity: 0, scale: 1.05 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.4, ease: "easeOut" }}
                      className="absolute inset-0"
                    >
                      <img
                        src={thumbnailUrl}
                        alt="Generated thumbnail"
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    </motion.div>
                  ) : (
                    <motion.div
                      key="empty"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="absolute inset-0 flex flex-col items-center justify-center text-neutral-400"
                    >
                      <ImageIcon className="w-12 h-12 mb-3 opacity-20" />
                      <span className="text-sm font-medium">Your thumbnail will appear here</span>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
              
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-neutral-900 line-clamp-1">
                      {eventDescription || "Event Title"}
                    </h3>
                    <p className="text-sm text-neutral-500 mt-1 flex items-center gap-1.5">
                      <MapPin className="w-4 h-4" /> Location TBD
                    </p>
                  </div>
                  <div className="bg-indigo-50 text-indigo-700 text-xs font-bold px-2.5 py-1 rounded-md">
                    NEW
                  </div>
                </div>
                
                <div className="flex items-center gap-4 text-sm text-neutral-600 border-t border-neutral-100 pt-4 mt-4">
                  <div className="flex items-center gap-1.5">
                    <Calendar className="w-4 h-4 text-neutral-400" />
                    <span>Select Date</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Users className="w-4 h-4 text-neutral-400" />
                    <span>Invite Friends</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
