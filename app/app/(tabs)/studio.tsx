import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { format } from 'date-fns';
import { api } from '../../src/api/client';
import { Badge } from '../../src/components/Badge';
import { Button } from '../../src/components/Button';
import { Card } from '../../src/components/Card';
import { EmptyState } from '../../src/components/EmptyState';
import { Screen } from '../../src/components/Screen';
import { SectionTitle } from '../../src/components/SectionTitle';
import { StarRating } from '../../src/components/StarRating';
import { TextField } from '../../src/components/TextField';
import { findArtist } from '../../src/data/mock';
import { useTheme } from '../../src/theme/ThemeContext';
import { GalleryItem, Review } from '../../src/types';

type Segment = 'gallery' | 'reviews';

export default function StudioScreen() {
  const { theme } = useTheme();
  const { palette, spacing, typeScale, radii } = theme;

  const [segment, setSegment] = useState<Segment>('gallery');
  const [loading, setLoading] = useState(true);
  const [gallery, setGallery] = useState<GalleryItem[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);

  const [writing, setWriting] = useState(false);
  const [draftRating, setDraftRating] = useState(5);
  const [draftBody, setDraftBody] = useState('');
  const [draftService, setDraftService] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const [galleryItems, reviewList] = await Promise.all([api.getGallery(), api.getReviews()]);
      if (!cancelled) {
        setGallery(galleryItems);
        setReviews(reviewList);
        setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const submitReview = async () => {
    if (!draftBody.trim()) {
      return;
    }
    setSubmitting(true);
    try {
      const updated = await api.submitReview(draftRating, draftBody, draftService.trim() || 'Studio visit');
      setReviews(updated);
      setWriting(false);
      setDraftBody('');
      setDraftService('');
      setDraftRating(5);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <Screen edges={['left', 'right']}>
        <View style={styles.loading}>
          <ActivityIndicator size="large" color={palette.accent} />
        </View>
      </Screen>
    );
  }

  return (
    <Screen scroll edges={['left', 'right']}>
      {/* Segmented control */}
      <View
        style={[
          styles.segmentTrack,
          { backgroundColor: palette.surfaceAlt, borderRadius: radii.sm, marginTop: spacing.sm },
        ]}
      >
        {(['gallery', 'reviews'] as Segment[]).map((key) => {
          const active = segment === key;
          return (
            <Pressable
              key={key}
              accessibilityRole="tab"
              accessibilityLabel={key === 'gallery' ? 'Gallery' : 'Reviews'}
              accessibilityState={{ selected: active }}
              onPress={() => setSegment(key)}
              style={[
                styles.segmentButton,
                { backgroundColor: active ? palette.surface : 'transparent', borderRadius: radii.sm },
              ]}
            >
              <Text
                style={[
                  typeScale.label,
                  { color: active ? palette.heading : palette.muted, textAlign: 'center' },
                ]}
              >
                {key === 'gallery' ? 'Gallery' : 'Reviews'}
              </Text>
            </Pressable>
          );
        })}
      </View>

      {segment === 'gallery' ? (
        <>
          <SectionTitle eyebrow="Before & after" title="Recent work" />
          {gallery.length === 0 ? (
            <EmptyState title="Nothing here yet" message="New sets are photographed every week." />
          ) : (
            gallery.map((item) => {
              const artist = findArtist(item.artistId);
              return (
                <Card key={item.id} style={{ marginBottom: spacing.md }}>
                  <View style={styles.pairRow}>
                    <View style={styles.pairCol}>
                      <Image
                        accessibilityLabel={`${item.title} — before`}
                        source={{ uri: item.beforeUrl }}
                        style={[styles.pairImage, { borderRadius: radii.sm, backgroundColor: palette.surfaceAlt }]}
                      />
                      <Text style={[typeScale.label, { color: palette.muted, marginTop: spacing.xs, fontSize: 9 }]}>
                        Before
                      </Text>
                    </View>
                    <View style={{ width: spacing.sm }} />
                    <View style={styles.pairCol}>
                      <Image
                        accessibilityLabel={`${item.title} — after`}
                        source={{ uri: item.afterUrl }}
                        style={[styles.pairImage, { borderRadius: radii.sm, backgroundColor: palette.surfaceAlt }]}
                      />
                      <Text
                        style={[typeScale.label, { color: palette.accentDeep, marginTop: spacing.xs, fontSize: 9 }]}
                      >
                        After
                      </Text>
                    </View>
                  </View>
                  <Text style={[typeScale.body, { color: palette.heading, fontWeight: '500', marginTop: spacing.sm }]}>
                    {item.title}
                  </Text>
                  <Text style={[typeScale.small, { color: palette.muted, marginTop: 2 }]}>
                    {item.serviceName}
                    {artist ? ` · ${artist.name}` : ''}
                  </Text>
                </Card>
              );
            })
          )}
        </>
      ) : (
        <>
          <SectionTitle
            eyebrow="Client words"
            title="Reviews"
            action={
              !writing ? (
                <Button
                  title="Leave a Review"
                  variant="ghost"
                  onPress={() => setWriting(true)}
                  style={{ minHeight: 36, paddingHorizontal: 0 }}
                />
              ) : undefined
            }
          />

          {writing ? (
            <Card alt style={{ marginBottom: spacing.lg }}>
              <Text style={[typeScale.label, { color: palette.muted, marginBottom: spacing.sm }]}>Your rating</Text>
              <StarRating rating={draftRating} onChange={setDraftRating} size={24} />
              <View style={{ height: spacing.md }} />
              <TextField
                label="Service (optional)"
                value={draftService}
                onChangeText={setDraftService}
                placeholder="e.g. Hybrid Set"
                autoCapitalize="words"
              />
              <TextField
                label="Your review"
                value={draftBody}
                onChangeText={setDraftBody}
                placeholder="How did your appointment go?"
                autoCapitalize="sentences"
                multiline
              />
              <Button title="Submit Review" onPress={submitReview} loading={submitting} disabled={!draftBody.trim()} />
              <Button title="Cancel" variant="ghost" onPress={() => setWriting(false)} style={{ marginTop: spacing.sm }} />
            </Card>
          ) : null}

          {reviews.length === 0 ? (
            <EmptyState title="No reviews yet" message="Be the first to share your experience." />
          ) : (
            reviews.map((review) => (
              <Card key={review.id} style={{ marginBottom: spacing.md }}>
                <View style={styles.reviewHeader}>
                  <StarRating rating={review.rating} />
                  <Badge label={review.serviceName} tone="blush" />
                </View>
                <Text style={[typeScale.body, { color: palette.text, marginTop: spacing.sm }]}>{review.body}</Text>
                <Text style={[typeScale.small, { color: palette.muted, marginTop: spacing.sm }]}>
                  {review.author} · {format(new Date(review.createdAt), 'MMMM d, yyyy')}
                </Text>
              </Card>
            ))
          )}
        </>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  loading: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  segmentTrack: { flexDirection: 'row', padding: 4 },
  segmentButton: { flex: 1, paddingVertical: 10 },
  pairRow: { flexDirection: 'row' },
  pairCol: { flex: 1 },
  pairImage: { width: '100%', aspectRatio: 0.85 },
  reviewHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
});
