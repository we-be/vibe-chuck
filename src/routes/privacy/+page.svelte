<script>
    import { onMount } from 'svelte';
    
    let Section;
    let Button;
    
    onMount(async () => {
        const module = await import('@skeletonlabs/skeleton');
        Section = module.Section;
        Button = module.Button;
    });
</script>

<div class="container mx-auto p-4 max-w-4xl">
    <h1 class="h1 mb-8 text-center">VIBE CHUCK Privacy Policy</h1>

    {#if Section}
        <svelte:component this={Section} tag="section" class="mb-8">
            <h2 class="h3 mb-4">1. Introduction</h2>
            <p class="mb-2">
                Welcome to VIBE CHUCK. We respect your privacy and are committed to protecting your personal data. This privacy policy will inform you about how we look after your personal data when you visit our website and mobile application and tell you about your privacy rights and how the law protects you.
            </p>
            <p>
                VIBE CHUCK is a social media platform for sharing and rating holiday decorations.
            </p>
        </svelte:component>

        <svelte:component this={Section} tag="section" class="mb-8">
            <h2 class="h3 mb-4">2. Data We Collect</h2>
            <p class="mb-2">We may collect and process the following data about you:</p>
            <ul class="list-disc pl-5 mb-4 space-y-2">
                <li>Identity Data: name, username, profile picture</li>
                <li>Contact Data: email address</li>
                <li>Technical Data: internet protocol (IP) address, login data, browser type and version, time zone setting, browser plug-in types and versions, operating system and platform</li>
                <li>User Content: photos, comments, and ratings you provide to the platform</li>
                <li>Location Data: city and neighborhood information (if provided)</li>
            </ul>
        </svelte:component>

        <svelte:component this={Section} tag="section" class="mb-8">
            <h2 class="h3 mb-4">3. How We Use Your Data</h2>
            <p class="mb-2">We use your data for the following purposes:</p>
            <ul class="list-disc pl-5 mb-4 space-y-2">
                <li>To create and manage your account</li>
                <li>To provide you with the platform's features and services</li>
                <li>To display user-generated content (holiday decoration photos)</li>
                <li>To rank and recommend content based on popularity and relevance</li>
                <li>To allow social interactions between users (likes, comments)</li>
                <li>To improve our platform and user experience</li>
                <li>To address technical issues and provide support</li>
            </ul>
        </svelte:component>

        <svelte:component this={Section} tag="section" class="mb-8">
            <h2 class="h3 mb-4">4. Third-Party Authentication</h2>
            <p class="mb-2">
                We offer the ability to sign up and log in using third-party authentication providers including Google and Instagram. 
                When you choose to use these services:
            </p>
            <ul class="list-disc pl-5 mb-4 space-y-2">
                <li>We may receive basic profile information from these platforms (such as name, email, and profile picture)</li>
                <li>We only use this information to create and manage your VIBE CHUCK account</li>
                <li>We do not request or store your passwords for these services</li>
                <li>Your use of these third-party services is subject to their respective privacy policies</li>
            </ul>
        </svelte:component>

        <svelte:component this={Section} tag="section" class="mb-8">
            <h2 class="h3 mb-4">5. Data Storage and Security</h2>
            <p class="mb-2">
                We use industry-standard security measures to protect your personal data. 
                Your data is stored securely on our servers and is only accessible by authorized personnel.
            </p>
            <p>
                We retain your data for as long as necessary to provide you with our services. 
                If you delete your account, we will delete or anonymize your personal data.
            </p>
        </svelte:component>

        <svelte:component this={Section} tag="section" class="mb-8">
            <h2 class="h3 mb-4">6. Your Rights</h2>
            <p class="mb-2">Under certain circumstances, you have rights under data protection laws in relation to your personal data, including the right to:</p>
            <ul class="list-disc pl-5 mb-4 space-y-2">
                <li>Request access to your personal data</li>
                <li>Request correction of your personal data</li>
                <li>Request erasure of your personal data</li>
                <li>Object to processing of your personal data</li>
                <li>Request restriction of processing your personal data</li>
                <li>Request transfer of your personal data</li>
                <li>Right to withdraw consent</li>
            </ul>
            <p>
                You can exercise any of these rights by contacting us through the app or emailing us at privacy@vibechuck.com.
            </p>
        </svelte:component>

        <svelte:component this={Section} tag="section" class="mb-8">
            <h2 class="h3 mb-4">7. Changes to This Privacy Policy</h2>
            <p>
                We may update this privacy policy from time to time. We will notify you of any changes by posting the new privacy policy on this page and updating the "Last Updated" date.
            </p>
        </svelte:component>

        <svelte:component this={Section} tag="section" class="mb-8">
            <h2 class="h3 mb-4">8. Contact Us</h2>
            <p>
                If you have any questions about this privacy policy or our data practices, please contact us at:
            </p>
            <p class="font-medium mt-2">privacy@vibechuck.com</p>
        </svelte:component>

        <div class="text-center mt-8 pb-8">
            <p class="text-sm text-gray-600">Last Updated: May 11, 2025</p>
        </div>
    {:else}
        <section class="mb-8">
            <h2 class="h3 mb-4">1. Introduction</h2>
            <p class="mb-2">
                Welcome to VIBE CHUCK. We respect your privacy and are committed to protecting your personal data. This privacy policy will inform you about how we look after your personal data when you visit our website and mobile application and tell you about your privacy rights and how the law protects you.
            </p>
            <p>
                VIBE CHUCK is a social media platform for sharing and rating holiday decorations.
            </p>
        </section>

        <section class="mb-8">
            <h2 class="h3 mb-4">2. Data We Collect</h2>
            <p class="mb-2">We may collect and process the following data about you:</p>
            <ul class="list-disc pl-5 mb-4 space-y-2">
                <li>Identity Data: name, username, profile picture</li>
                <li>Contact Data: email address</li>
                <li>Technical Data: internet protocol (IP) address, login data, browser type and version, time zone setting, browser plug-in types and versions, operating system and platform</li>
                <li>User Content: photos, comments, and ratings you provide to the platform</li>
                <li>Location Data: city and neighborhood information (if provided)</li>
            </ul>
        </section>

        <section class="mb-8">
            <h2 class="h3 mb-4">3. How We Use Your Data</h2>
            <p class="mb-2">We use your data for the following purposes:</p>
            <ul class="list-disc pl-5 mb-4 space-y-2">
                <li>To create and manage your account</li>
                <li>To provide you with the platform's features and services</li>
                <li>To display user-generated content (holiday decoration photos)</li>
                <li>To rank and recommend content based on popularity and relevance</li>
                <li>To allow social interactions between users (likes, comments)</li>
                <li>To improve our platform and user experience</li>
                <li>To address technical issues and provide support</li>
            </ul>
        </section>

        <section class="mb-8">
            <h2 class="h3 mb-4">4. Third-Party Authentication</h2>
            <p class="mb-2">
                We offer the ability to sign up and log in using third-party authentication providers including Google and Instagram. 
                When you choose to use these services:
            </p>
            <ul class="list-disc pl-5 mb-4 space-y-2">
                <li>We may receive basic profile information from these platforms (such as name, email, and profile picture)</li>
                <li>We only use this information to create and manage your VIBE CHUCK account</li>
                <li>We do not request or store your passwords for these services</li>
                <li>Your use of these third-party services is subject to their respective privacy policies</li>
            </ul>
        </section>

        <section class="mb-8">
            <h2 class="h3 mb-4">5. Data Storage and Security</h2>
            <p class="mb-2">
                We use industry-standard security measures to protect your personal data. 
                Your data is stored securely on our servers and is only accessible by authorized personnel.
            </p>
            <p>
                We retain your data for as long as necessary to provide you with our services. 
                If you delete your account, we will delete or anonymize your personal data.
            </p>
        </section>

        <section class="mb-8">
            <h2 class="h3 mb-4">6. Your Rights</h2>
            <p class="mb-2">Under certain circumstances, you have rights under data protection laws in relation to your personal data, including the right to:</p>
            <ul class="list-disc pl-5 mb-4 space-y-2">
                <li>Request access to your personal data</li>
                <li>Request correction of your personal data</li>
                <li>Request erasure of your personal data</li>
                <li>Object to processing of your personal data</li>
                <li>Request restriction of processing your personal data</li>
                <li>Request transfer of your personal data</li>
                <li>Right to withdraw consent</li>
            </ul>
            <p>
                You can exercise any of these rights by contacting us through the app or emailing us at privacy@vibechuck.com.
            </p>
        </section>

        <section class="mb-8">
            <h2 class="h3 mb-4">7. Changes to This Privacy Policy</h2>
            <p>
                We may update this privacy policy from time to time. We will notify you of any changes by posting the new privacy policy on this page and updating the "Last Updated" date.
            </p>
        </section>

        <section class="mb-8">
            <h2 class="h3 mb-4">8. Contact Us</h2>
            <p>
                If you have any questions about this privacy policy or our data practices, please contact us at:
            </p>
            <p class="font-medium mt-2">privacy@vibechuck.com</p>
        </section>

        <div class="text-center mt-8 pb-8">
            <p class="text-sm text-gray-600">Last Updated: May 11, 2025</p>
        </div>
    {/if}
    
    <div class="text-center mt-8">
        {#if Button}
            <svelte:component this={Button} href="/" variant="filled" color="primary">
                Return Home
            </svelte:component>
        {:else}
            <a href="/" class="btn variant-filled-primary">Return Home</a>
        {/if}
    </div>
</div>