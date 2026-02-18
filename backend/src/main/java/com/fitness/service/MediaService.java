package com.fitness.service;

import io.awspring.cloud.s3.S3Template;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnBean;
import org.springframework.stereotype.Service;

import java.net.URL;
import java.time.Duration;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@ConditionalOnBean(S3Template.class)
public class MediaService {

    private final S3Template s3Template;

    @Value("${spring.cloud.aws.s3.bucket:fitness-bucket}")
    private String bucketName;

    public PresignedUrl presignUpload(String contentType, String folder) {
        String key = folder + "/" + UUID.randomUUID().toString();
        URL url = s3Template.createSignedPutURL(bucketName, key, Duration.ofMinutes(15), null, contentType);

        // Construct public URL (assuming public read access or CloudFront)
        String publicUrl = "https://" + bucketName + ".s3.amazonaws.com/" + key;

        return new PresignedUrl(url.toString(), publicUrl, key);
    }

    public record PresignedUrl(String putUrl, String publicUrl, String key) {
    }
}
