import { useEffect, useState } from 'react';
import { useMutation } from '@apollo/client';
import {
  Button,
  Form,
  Input,
  Label,
  MultipleSelector,
  ColorPicker,
  Spinner,
  Switch,
  Textarea,
  useToast,
} from 'erxes-ui';
import { Select } from 'erxes-ui/components/select';
import { IconEye, IconEyeOff, IconTrash, IconPlus } from '@tabler/icons-react';
import { Accordion } from 'erxes-ui/components/accordion';
import { Tabs } from 'erxes-ui/components/tabs';
import { Editor } from 'erxes-ui/modules/blocks/components';
import { Upload } from 'erxes-ui';
import { CLIENT_PORTAL_CONFIG_UPDATE } from '@/client-portal/graphql/mutations';
import { CLIENT_PORTAL_GET_CONFIGS } from '@/client-portal/graphql/queries';
import { LANGUAGES } from '@/settings/general/constants/data';
import { useSwitchLanguage } from '~/i18n';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { AppPath } from '@/types/paths/AppPath';

export function WebsiteForm({ initialConfig }: { initialConfig?: any }) {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [name, setName] = useState('');
  const [kind, setKind] = useState<'client' | 'vendor' | ''>('');
  const [url, setUrl] = useState('');
  const [domain, setDomain] = useState('');
  const [description, setDescription] = useState('');
  const [ticketLabel, setTicketLabel] = useState('');
  const [dealLabel, setDealLabel] = useState('');
  const [purchaseLabel, setPurchaseLabel] = useState('');
  const [taskLabel, setTaskLabel] = useState('');
  const [taskPublicBoardId, setTaskPublicBoardId] = useState('');
  const [taskPublicPipelineId, setTaskPublicPipelineId] = useState('');
  const [taskPublicLabel, setTaskPublicLabel] = useState('');
  const [taskStageId, setTaskStageId] = useState('');
  const [taskPipelineId, setTaskPipelineId] = useState('');
  const [taskBoardId, setTaskBoardId] = useState('');
  const [ticketStageId, setTicketStageId] = useState('');
  const [ticketPipelineId, setTicketPipelineId] = useState('');
  const [ticketBoardId, setTicketBoardId] = useState('');
  const [dealStageId, setDealStageId] = useState('');
  const [dealPipelineId, setDealPipelineId] = useState('');
  const [dealBoardId, setDealBoardId] = useState('');
  const [purchaseStageId, setPurchaseStageId] = useState('');
  const [purchasePipelineId, setPurchasePipelineId] = useState('');
  const [purchaseBoardId, setPurchaseBoardId] = useState('');

  const [kbToggle, setKbToggle] = useState(false);
  const [publicTaskToggle, setPublicTaskToggle] = useState(false);
  const [ticketToggle, setTicketToggle] = useState(false);
  const [taskToggle, setTaskToggle] = useState(false);
  const [dealToggle, setDealToggle] = useState(false);
  const [purchaseToggle, setPurchaseToggle] = useState(false);

  const [googleClientId, setGoogleClientId] = useState('');
  const [googleClientSecret, setGoogleClientSecret] = useState('');
  const [googleRedirectUri, setGoogleRedirectUri] = useState('');
  const [facebookAppId, setFacebookAppId] = useState('');
  const [erxesAppToken, setErxesAppToken] = useState('');
  const { currentLanguage, languages: availableLanguages } =
    useSwitchLanguage();
  const form = useForm<{ languages: string[] }>({
    defaultValues: {
      languages: currentLanguage ? [currentLanguage] : [],
    },
  });

  const [defaultLanguage, setDefaultLanguage] = useState<string>(
    currentLanguage || '',
  );

  useEffect(() => {
    if (!initialConfig) return;
    setName(initialConfig.name || '');
    setKind((initialConfig.kind as any) || '');
    setUrl(initialConfig.url || '');
    setDomain(initialConfig.domain || '');
    setDescription(initialConfig.description || '');
    setTicketLabel(initialConfig.ticketLabel || '');
    setDealLabel(initialConfig.dealLabel || '');
    setPurchaseLabel(initialConfig.purchaseLabel || '');
    setTaskLabel(initialConfig.taskLabel || '');
    setTaskPublicBoardId(initialConfig.taskPublicBoardId || '');
    setTaskPublicPipelineId(initialConfig.taskPublicPipelineId || '');
    setTaskPublicLabel(initialConfig.taskPublicLabel || '');
    setTaskStageId(initialConfig.taskStageId || '');
    setTaskPipelineId(initialConfig.taskPipelineId || '');
    setTaskBoardId(initialConfig.taskBoardId || '');
    setTicketStageId(initialConfig.ticketStageId || '');
    setTicketPipelineId(initialConfig.ticketPipelineId || '');
    setTicketBoardId(initialConfig.ticketBoardId || '');
    setDealStageId(initialConfig.dealStageId || '');
    setDealPipelineId(initialConfig.dealPipelineId || '');
    setDealBoardId(initialConfig.dealBoardId || '');
    setPurchaseStageId(initialConfig.purchaseStageId || '');
    setPurchasePipelineId(initialConfig.purchasePipelineId || '');
    setPurchaseBoardId(initialConfig.purchaseBoardId || '');

    setKbToggle(!!initialConfig.kbToggle);
    setPublicTaskToggle(!!initialConfig.publicTaskToggle);
    setTicketToggle(!!initialConfig.ticketToggle);
    setTaskToggle(!!initialConfig.taskToggle);
    setDealToggle(!!initialConfig.dealToggle);
    setPurchaseToggle(!!initialConfig.purchaseToggle);

    setGoogleClientId(initialConfig.googleClientId || '');
    setGoogleClientSecret(initialConfig.googleClientSecret || '');
    setGoogleRedirectUri(initialConfig.googleRedirectUri || '');
    setFacebookAppId(initialConfig.facebookAppId || '');
    setErxesAppToken(initialConfig.erxesAppToken || '');

    setLogoUrl(initialConfig.logo || '');
    setIconUrl(initialConfig.icon || '');

    const styles = initialConfig.styles || {};
    setColorBody(styles.bodyColor ?? '#ffffff');
    setColorHeader(styles.headerColor ?? '#ffffff');
    setColorFooter(styles.footerColor ?? '#ffffff');
    setColorHelpCenter(styles.helpColor ?? '#ffffff');
    setColorBackground(styles.backgroundColor ?? '#ffffff');
    setColorActiveTab(styles.activeTabColor ?? '#6d28d9');
    setBaseFont(styles.baseFont ?? '');
    setBaseColor(styles.baseColor ?? '#111111');
    setHeadingFont(styles.headingFont ?? '');
    setHeadingColor(styles.headingColor ?? '#111111');
    setLinkTextColor(styles.linkColor ?? '#2563eb');
    setLinkHoverTextColor(styles.linkHoverColor ?? '#1d4ed8');
    setPrimaryBtnColor(styles.primaryBtnColor ?? '#6d28d9');
    setSecondaryBtnColor(styles.secondaryBtnColor ?? '#e5e7eb');
    setDividerGlowColor(styles.dividerColor ?? '#e5e7eb');

    const otp = initialConfig.otpConfig || {};
    setOtpEnable(
      !!otp.codeLength ||
        !!otp.emailSubject ||
        !!otp.content ||
        !!otp.loginWithOTP,
    );
    setOtpCodeLength(otp.codeLength ?? '');
    setOtpExpireAfter(otp.expireAfter ?? '');
    setOtpLoginWithOTP(!!otp.loginWithOTP);
    setOtpEmailSubject(otp.emailSubject || '');
    setOtpSmsTransporterType(otp.smsTransporterType || '');
    setOtpContent(otp.content || '');

    const two = initialConfig.twoFactorConfig || {};
    setTwoFactorEnable(!!two.enableTwoFactor);
    setTwoFactorCodeLength(two.codeLength ?? '');
    setTwoFactorExpireAfter(two.expireAfter ?? '');
    setTwoFactorEmailSubject(two.emailSubject || '');
    setTwoFactorSmsTransporterType(two.smsTransporterType || '');
    setTwoFactorContent(two.content || '');

    const mail = initialConfig.mailConfig || {};
    setMailEnable(
      !!(mail.subject || mail.invitationContent || mail.registrationContent),
    );
    setMailSubject(mail.subject || '');
    setMailInvitationContent(mail.invitationContent || '');
    setMailRegistrationContent(mail.registrationContent || '');

    const manual = initialConfig.manualVerificationConfig || {};
    setManualEnable(!!(manual.verifyCustomer || manual.verifyCompany));
    setVerifyCustomer(!!manual.verifyCustomer);
    setVerifyCompany(!!manual.verifyCompany);

    const pass = initialConfig.passwordVerificationConfig || {};
    setPasswordVerifyByOTP(!!pass.verifyByOTP);
    setPasswordEmailSubject(pass.emailSubject || '');
    setPasswordEmailContent(pass.emailContent || '');
    setPasswordSmsContent(pass.smsContent || '');

    const social = initialConfig.socialpayConfig || {};
    setSocialpayCertId(social.certId || '');
    setSocialpayPublicKey(social.publicKey || '');

    setHeaderHtml(initialConfig.headerHtml || '');
    setFooterHtml(initialConfig.footerHtml || '');

    const lngs: string[] =
      initialConfig.languages ||
      (initialConfig.language ? [initialConfig.language] : []);
    if (lngs.length) {
      form.setValue('languages', lngs);
      setDefaultLanguage(initialConfig.language || lngs[0]);
    }
  }, [initialConfig]);

  const [otpCodeLength, setOtpCodeLength] = useState<number | ''>('');
  const [otpExpireAfter, setOtpExpireAfter] = useState<number | ''>('');
  const [otpEnable, setOtpEnable] = useState(false);
  const [otpLoginWithOTP, setOtpLoginWithOTP] = useState(false);
  const [otpEmailSubject, setOtpEmailSubject] = useState('');
  const [otpSmsTransporterType, setOtpSmsTransporterType] = useState('');
  const [otpContent, setOtpContent] = useState('');

  const [twoFactorEnable, setTwoFactorEnable] = useState(false);
  const [twoFactorCodeLength, setTwoFactorCodeLength] = useState<number | ''>(
    '',
  );
  const [twoFactorExpireAfter, setTwoFactorExpireAfter] = useState<number | ''>(
    '',
  );
  const [twoFactorEmailSubject, setTwoFactorEmailSubject] = useState('');
  const [twoFactorSmsTransporterType, setTwoFactorSmsTransporterType] =
    useState('');
  const [twoFactorContent, setTwoFactorContent] = useState('');

  const [mailSubject, setMailSubject] = useState('');
  const [mailInvitationContent, setMailInvitationContent] = useState('');
  const [mailRegistrationContent, setMailRegistrationContent] = useState('');

  const [logoUrl, setLogoUrl] = useState<string>('');
  const [iconUrl, setIconUrl] = useState<string>('');
  const [colorBody, setColorBody] = useState<string>('#ffffff');
  const [colorHeader, setColorHeader] = useState<string>('#ffffff');
  const [colorFooter, setColorFooter] = useState<string>('#ffffff');
  const [colorHelpCenter, setColorHelpCenter] = useState<string>('#ffffff');
  const [colorBackground, setColorBackground] = useState<string>('#ffffff');
  const [colorActiveTab, setColorActiveTab] = useState<string>('#6d28d9');
  const [baseFont, setBaseFont] = useState<string>('');
  const [baseColor, setBaseColor] = useState<string>('#111111');
  const [headingFont, setHeadingFont] = useState<string>('');
  const [headingColor, setHeadingColor] = useState<string>('#111111');
  const [linkTextColor, setLinkTextColor] = useState<string>('#2563eb');
  const [linkHoverTextColor, setLinkHoverTextColor] =
    useState<string>('#1d4ed8');
  const [primaryBtnColor, setPrimaryBtnColor] = useState<string>('#6d28d9');
  const [secondaryBtnColor, setSecondaryBtnColor] = useState<string>('#e5e7eb');
  const [dividerGlowColor, setDividerGlowColor] = useState<string>('#e5e7eb');
  const [headerHtml, setHeaderHtml] = useState<string>('');
  const [footerHtml, setFooterHtml] = useState<string>('');

  const [tokenPassMethod, setTokenPassMethod] = useState<'cookie' | 'bearer'>(
    'cookie',
  );
  const [tokenExpireAfterDays, setTokenExpireAfterDays] = useState<number | ''>(
    1,
  );
  const [refreshTokenExpireAfterDays, setRefreshTokenExpireAfterDays] =
    useState<number | ''>(7);

  const [testUserEmail, setTestUserEmail] = useState('');
  const [testUserPhone, setTestUserPhone] = useState('');
  const [testUserPassword, setTestUserPassword] = useState('');
  const [testUserOtp, setTestUserOtp] = useState('');

  const [mailEnable, setMailEnable] = useState(false);

  const [manualEnable, setManualEnable] = useState(false);

  const [tokiApiKey, setTokiApiKey] = useState('');
  const [tokiMerchantId, setTokiMerchantId] = useState('');
  const [tokiUsername, setTokiUsername] = useState('');
  const [tokiPassword, setTokiPassword] = useState('');
  const [tokiProduction, setTokiProduction] = useState(false);

  const [authSectionsOpen, setAuthSectionsOpen] = useState<string[]>([]);

  type EnvVar = { id: string; key: string; value: string; hidden: boolean };
  const [envVars, setEnvVars] = useState<EnvVar[]>([
    { id: crypto.randomUUID(), key: '', value: '', hidden: true },
  ]);

  const addEnvVar = () =>
    setEnvVars((prev) => [
      ...prev,
      { id: crypto.randomUUID(), key: '', value: '', hidden: true },
    ]);

  const removeEnvVar = (id: string) =>
    setEnvVars((prev) => prev.filter((e) => e.id !== id));

  const updateEnvVar = (
    id: string,
    patch: Partial<{ key: string; value: string; hidden: boolean }>,
  ) =>
    setEnvVars((prev) =>
      prev.map((e) => (e.id === id ? { ...e, ...patch } : e)),
    );

  const convertHTMLToBlocks = (htmlContent: string) => {
    if (!htmlContent || htmlContent.trim() === '') {
      return undefined;
    }
    if (htmlContent.startsWith('[')) {
      try {
        const parsed = JSON.parse(htmlContent);
        if (Array.isArray(parsed)) return htmlContent;
      } catch (_) {}
    }
    if (htmlContent.includes('<') && htmlContent.includes('>')) {
      const parser = new DOMParser();
      const doc = parser.parseFromString(htmlContent, 'text/html');
      const container = doc.body;
      const children = Array.from(container.children);
      const blocks: any[] = [];
      if (children.length === 0) {
        const textContent = container.textContent || container.innerText || '';
        if (textContent.trim()) {
          blocks.push({
            id: crypto.randomUUID(),
            type: 'paragraph',
            props: {
              textColor: 'default',
              backgroundColor: 'default',
              textAlignment: 'left',
            },
            content: [{ type: 'text', text: textContent, styles: {} }],
            children: [],
          });
        }
      } else {
        children.forEach((element) => {
          const tagName = element.tagName.toLowerCase();
          const textContent = element.textContent || '';
          if (textContent.trim()) {
            let blockType = 'paragraph';
            const props: any = {
              textColor: 'default',
              backgroundColor: 'default',
              textAlignment: 'left',
            };
            if (/^h[1-6]$/.test(tagName)) {
              blockType = 'heading';
              props.level = parseInt(tagName.charAt(1));
            }
            blocks.push({
              id: crypto.randomUUID(),
              type: blockType,
              props,
              content: [{ type: 'text', text: textContent, styles: {} }],
              children: [],
            });
          }
        });
      }
      return blocks.length ? JSON.stringify(blocks) : undefined;
    }
    if (htmlContent.trim()) {
      const wrapped = `<p>${htmlContent}</p>`;
      return convertHTMLToBlocks(wrapped);
    }
    return undefined;
  };

  const handleRichTextChange = (
    value: string,
    setter: (val: string) => void,
  ) => {
    try {
      const blocks = JSON.parse(value);
      const htmlContent = (blocks || [])
        .map((block: any) => {
          if (block.type === 'paragraph' && block.content) {
            const textContent = block.content
              .map((i: any) => i.text || '')
              .join('');
            return textContent ? `<p>${textContent}</p>` : '';
          }
          if (block.type === 'heading' && block.content) {
            const textContent = block.content
              .map((i: any) => i.text || '')
              .join('');
            const level = (block.props as any)?.level || 1;
            return textContent ? `<h${level}>${textContent}</h${level}>` : '';
          }
          return '';
        })
        .filter(Boolean)
        .join('');
      setter(htmlContent);
    } catch (_) {
      setter('');
    }
  };

  const handleHeaderEditorChange = async (
    value: string,
    editorInstance?: any,
  ) => {
    try {
      const blocks = JSON.parse(value);
      if (editorInstance?.blocksToHTMLLossy) {
        const htmlContent = await editorInstance.blocksToHTMLLossy(blocks);
        setHeaderHtml(htmlContent);
        return;
      }
      const htmlContent = (blocks || [])
        .map((block: any) => {
          if (block.type === 'paragraph' && block.content) {
            const textContent = block.content
              .map((i: any) => i.text || '')
              .join('');
            return textContent ? `<p>${textContent}</p>` : '';
          }
          if (block.type === 'heading' && block.content) {
            const textContent = block.content
              .map((i: any) => i.text || '')
              .join('');
            const level = (block.props as any)?.level || 1;
            return textContent ? `<h${level}>${textContent}</h${level}>` : '';
          }
          return '';
        })
        .filter(Boolean)
        .join('');
      setHeaderHtml(htmlContent);
    } catch (_) {
      setHeaderHtml('');
    }
  };

  const handleFooterEditorChange = async (
    value: string,
    editorInstance?: any,
  ) => {
    try {
      const blocks = JSON.parse(value);
      if (editorInstance?.blocksToHTMLLossy) {
        const htmlContent = await editorInstance.blocksToHTMLLossy(blocks);
        setFooterHtml(htmlContent);
        return;
      }
      const htmlContent = (blocks || [])
        .map((block: any) => {
          if (block.type === 'paragraph' && block.content) {
            const textContent = block.content
              .map((i: any) => i.text || '')
              .join('');
            return textContent ? `<p>${textContent}</p>` : '';
          }
          if (block.type === 'heading' && block.content) {
            const textContent = block.content
              .map((i: any) => i.text || '')
              .join('');
            const level = (block.props as any)?.level || 1;
            return textContent ? `<h${level}>${textContent}</h${level}>` : '';
          }
          return '';
        })
        .filter(Boolean)
        .join('');
      setFooterHtml(htmlContent);
    } catch (_) {
      setFooterHtml('');
    }
  };

  const [verifyCustomer, setVerifyCustomer] = useState(false);
  const [verifyCompany, setVerifyCompany] = useState(false);

  const [passwordVerifyByOTP, setPasswordVerifyByOTP] = useState(false);
  const [passwordEmailSubject, setPasswordEmailSubject] = useState('');
  const [passwordEmailContent, setPasswordEmailContent] = useState('');
  const [passwordSmsContent, setPasswordSmsContent] = useState('');

  const [socialpayCertId, setSocialpayCertId] = useState('');
  const [socialpayPublicKey, setSocialpayPublicKey] = useState('');

  const [save, { loading }] = useMutation(CLIENT_PORTAL_CONFIG_UPDATE, {
    refetchQueries: [
      { query: CLIENT_PORTAL_GET_CONFIGS, variables: { limit: 10 } },
    ],
    awaitRefetchQueries: true,
  });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name) return;
    if (!kind) {
      toast({ title: 'Error', description: 'Please select portal kind', variant: 'destructive' });
      return;
    }
    const selectedLanguages = form.getValues('languages') || [];
    const ensuredLanguages = selectedLanguages.length
      ? selectedLanguages
      : currentLanguage
      ? [currentLanguage]
      : [];
    const ensuredDefault = ensuredLanguages?.includes(defaultLanguage)
      ? defaultLanguage
      : ensuredLanguages[0];

    const safeOtpLen =
      otpCodeLength === '' ? undefined : Math.max(4, otpCodeLength as number);
    const safeTwoLen =
      twoFactorCodeLength === ''
        ? undefined
        : Math.max(4, twoFactorCodeLength as number);

    const config: Record<string, any> = {
      _id: initialConfig?._id,
      name,
      kind,
      domain: domain || undefined,
      description: description || undefined,
      ticketLabel: ticketLabel || undefined,
      dealLabel: dealLabel || undefined,
      purchaseLabel: purchaseLabel || undefined,
      taskLabel: taskLabel || undefined,
      taskPublicBoardId: taskPublicBoardId || undefined,
      taskPublicPipelineId: taskPublicPipelineId || undefined,
      taskPublicLabel: taskPublicLabel || undefined,
      taskStageId: taskStageId || undefined,
      taskPipelineId: taskPipelineId || undefined,
      taskBoardId: taskBoardId || undefined,
      ticketStageId: ticketStageId || undefined,
      ticketPipelineId: ticketPipelineId || undefined,
      ticketBoardId: ticketBoardId || undefined,
      dealStageId: dealStageId || undefined,
      dealPipelineId: dealPipelineId || undefined,
      dealBoardId: dealBoardId || undefined,
      purchaseStageId: purchaseStageId || undefined,
      purchasePipelineId: purchasePipelineId || undefined,
      purchaseBoardId: purchaseBoardId || undefined,
      kbToggle,
      publicTaskToggle,
      ticketToggle,
      taskToggle,
      dealToggle,
      purchaseToggle,
      googleClientId: googleClientId || undefined,
      googleClientSecret: googleClientSecret || undefined,
      googleRedirectUri: googleRedirectUri || undefined,
      facebookAppId: facebookAppId || undefined,
      erxesAppToken: erxesAppToken || undefined,
      language: ensuredDefault,
      otpConfig: otpEnable
        ? {
            codeLength: safeOtpLen,
            expireAfter: otpExpireAfter === '' ? undefined : otpExpireAfter,
            loginWithOTP: otpLoginWithOTP,
            emailSubject: otpEmailSubject || undefined,
            smsTransporterType: otpSmsTransporterType || undefined,
            content: otpContent || undefined,
          }
        : undefined,
      twoFactorConfig: twoFactorEnable
        ? {
            enableTwoFactor: true,
            codeLength: safeTwoLen,
            expireAfter:
              twoFactorExpireAfter === '' ? undefined : twoFactorExpireAfter,
            emailSubject: twoFactorEmailSubject || undefined,
            smsTransporterType: twoFactorSmsTransporterType || undefined,
            content: twoFactorContent || undefined,
          }
        : undefined,
      mailConfig: mailEnable
        ? {
            subject: mailSubject || undefined,
            invitationContent: mailInvitationContent || undefined,
            registrationContent: mailRegistrationContent || undefined,
          }
        : undefined,
      manualVerificationConfig: manualEnable
        ? {
            verifyCustomer,
            verifyCompany,
          }
        : undefined,
      passwordVerificationConfig: {
        verifyByOTP: passwordVerifyByOTP,
        emailSubject: passwordEmailSubject || undefined,
        emailContent: passwordEmailContent || undefined,
        smsContent: passwordSmsContent || undefined,
      },
      socialpayConfig: {
        certId: socialpayCertId || undefined,
        publicKey: socialpayPublicKey || undefined,
      },
      headerHtml: headerHtml || undefined,
      footerHtml: footerHtml || undefined,
      styles: {
        bodyColor: colorBody,
        headerColor: colorHeader,
        footerColor: colorFooter,
        helpColor: colorHelpCenter,
        backgroundColor: colorBackground,
        activeTabColor: colorActiveTab,
        baseColor: baseColor,
        headingColor: headingColor,
        linkColor: linkTextColor,
        linkHoverColor: linkHoverTextColor,
        baseFont: baseFont,
        headingFont: headingFont,
        dividerColor: dividerGlowColor,
        primaryBtnColor: primaryBtnColor,
        secondaryBtnColor: secondaryBtnColor,
      },
    };

    try {
      await save({ variables: { config } });
      toast({
        title: 'Success',
        description: initialConfig?._id ? 'Website updated' : 'Website created',
      });
      navigate(`/${AppPath.ClientPortal}`);
    } catch (err: any) {
      toast({
        title: 'Error',
        description: err?.message || 'Failed to save',
        variant: 'destructive',
      });
    }
  }

  return (
    <form id="website-form" onSubmit={handleSubmit} className="min-h-full">
      <Tabs defaultValue="general" className="w-full">
        <Tabs.List className="w-full flex justify-around">
          <Tabs.Trigger value="general">General Settings</Tabs.Trigger>
          <Tabs.Trigger value="appearance">Appearance</Tabs.Trigger>
          <Tabs.Trigger value="auth">Authentication</Tabs.Trigger>
          <Tabs.Trigger value="env">Environment Variables</Tabs.Trigger>
        </Tabs.List>

        <Tabs.Content value="general" className="pt-4 overflow-visible">
          <Form {...form}>
            <div className="pr-2">
              <div className="space-y-4 pb-2">
                <div className="grid grid-cols-1 px-2 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <Label htmlFor="name">Name</Label>
                    <Input
                      id="name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                    />
                  </div>

                  <div className="space-y-1">
                    <Label htmlFor="domain">Website URL</Label>
                    <Input
                      id="domain"
                      value={domain}
                      onChange={(e) => setDomain(e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Kind</Label>
                    <Select value={kind} onValueChange={(v) => setKind(v as 'client' | 'vendor')}>
                      <Select.Trigger className="w-full py-4">
                        <Select.Value placeholder="Select..." />
                      </Select.Trigger>
                      <Select.Content>
                        <Select.Item value="client">Client Portal</Select.Item>
                        <Select.Item value="vendor">Vendor</Select.Item>
                      </Select.Content>
                    </Select>
                  </div>
                </div>

                <div className="space-y-1 px-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    rows={3}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                  />
                </div>

                <div className="grid px-2 grid-cols-1 md:grid-cols-2 gap-4">
                  <Form.Field
                    control={form.control}
                    name="languages"
                    render={({ field }) => (
                      <Form.Item>
                        <Form.Label>Languages</Form.Label>
                        <Form.Control>
                          <MultipleSelector
                            defaultOptions={LANGUAGES.map((l) => ({
                              label: l.label,
                              value: l.value,
                            }))}
                            onSearchSync={(term) =>
                              LANGUAGES.filter(
                                (o) =>
                                  o.label
                                    .toLowerCase()
                                    .includes(term.toLowerCase()) ||
                                  o.value
                                    .toLowerCase()
                                    .includes(term.toLowerCase()),
                              ).map((l) => ({ label: l.label, value: l.value }))
                            }
                            triggerSearchOnFocus
                            value={(field.value || []).map((lng) => ({
                              value: lng,
                              label:
                                LANGUAGES.find((l) => l.value === lng)?.label ||
                                lng,
                            }))}
                            onChange={(val) =>
                              field.onChange(val.map((v) => v.value))
                            }
                            placeholder="Select..."
                            hideClearAllButton
                            hidePlaceholderWhenSelected
                            className="w-full"
                            badgeClassName="h-6"
                            commandProps={{
                              shouldFilter: false,
                              className: 'max-h-72',
                            }}
                          />
                        </Form.Control>
                        <Form.Message />
                      </Form.Item>
                    )}
                  />
                  <div className="space-y-2">
                    <Label>Default language</Label>
                    <Select
                      value={defaultLanguage}
                      onValueChange={(v) => setDefaultLanguage(v as string)}
                    >
                      <Select.Trigger className="w-full py-4">
                        <Select.Value placeholder="Select..." />
                      </Select.Trigger>
                      <Select.Content>
                        {(form.watch('languages')?.length
                          ? form.watch('languages')
                          : availableLanguages
                        ).map((code) => (
                          <Select.Item key={code} value={code}>
                            {LANGUAGES.find((l) => l.value === code)?.label ||
                              code}
                          </Select.Item>
                        ))}
                      </Select.Content>
                    </Select>
                  </div>
                </div>
              </div>
            </div>
          </Form>
        </Tabs.Content>

        <Tabs.Content
          value="appearance"
          className="pt-4 pb-24 min-h-[calc(100vh+200px)] overflow-visible"
        >
          <div className="px-2 space-y-8">
            <div className="space-y-4">
              <div className="text-sm font-semibold text-primary">
                Logo and favicon
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-2">
                  <div className="text-[10px] uppercase text-muted-foreground">
                    Main Logo
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Business portal main logo PNG.
                  </div>
                  <Upload.Root
                    value={logoUrl}
                    onChange={(payload: any) => setLogoUrl(payload?.url)}
                  >
                    <Upload.Preview />
                    <div className="flex gap-2">
                      <Upload.Button variant="outline" />
                      <Upload.RemoveButton variant="ghost" />
                    </div>
                  </Upload.Root>
                </div>
                <div className="space-y-2">
                  <div className="text-[10px] uppercase text-muted-foreground">
                    Favicon
                  </div>
                  <div className="text-xs text-muted-foreground">
                    16x16px transparent PNG.
                  </div>
                  <Upload.Root
                    value={iconUrl}
                    onChange={(payload: any) => setIconUrl(payload?.url)}
                  >
                    <Upload.Preview />
                    <div className="flex gap-2">
                      <Upload.Button variant="outline" />
                      <Upload.RemoveButton variant="ghost" />
                    </div>
                  </Upload.Root>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="text-sm font-semibold text-primary">
                Main colors
              </div>
              <div className="text-[10px] uppercase text-muted-foreground">
                Background color
              </div>
              <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
                <div className="space-y-1">
                  <div className="text-xs text-muted-foreground">Body</div>
                  <ColorPicker
                    value={colorBody}
                    onValueChange={(value) => setColorBody(value)}
                  />
                </div>
                <div className="space-y-1">
                  <div className="text-xs text-muted-foreground">Header</div>
                  <ColorPicker
                    value={colorHeader}
                    onValueChange={(value) => setColorHeader(value)}
                  />
                </div>
                <div className="space-y-1">
                  <div className="text-xs text-muted-foreground">Footer</div>
                  <ColorPicker
                    value={colorFooter}
                    onValueChange={(value) => setColorFooter(value)}
                  />
                </div>
                <div className="space-y-1">
                  <div className="text-xs text-muted-foreground">
                    Help Center
                  </div>
                  <ColorPicker
                    value={colorHelpCenter}
                    onValueChange={(value) => setColorHelpCenter(value)}
                  />
                </div>
                <div className="space-y-1">
                  <div className="text-xs text-muted-foreground">
                    Background
                  </div>
                  <ColorPicker
                    value={colorBackground}
                    onValueChange={(value) => setColorBackground(value)}
                  />
                </div>
                <div className="space-y-1">
                  <div className="text-xs text-muted-foreground">
                    Active tab
                  </div>
                  <ColorPicker
                    value={colorActiveTab}
                    onValueChange={(value) => setColorActiveTab(value)}
                  />
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="text-sm font-semibold text-primary">
                Fonts and color
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-1">
                  <div className="text-[10px] uppercase text-muted-foreground">
                    Base font
                  </div>
                  <Select
                    value={baseFont}
                    onValueChange={(v) => setBaseFont(v as string)}
                  >
                    <Select.Trigger className="w-full">
                      <Select.Value placeholder="Please select a font" />
                    </Select.Trigger>
                    <Select.Content>
                      {['Inter', 'Roboto', 'Arial', 'System'].map((f) => (
                        <Select.Item key={f} value={f}>
                          {f}
                        </Select.Item>
                      ))}
                    </Select.Content>
                  </Select>
                </div>
                <div className="space-y-1">
                  <div className="text-[10px] uppercase text-muted-foreground">
                    Base Color
                  </div>
                  <ColorPicker
                    value={baseColor}
                    onValueChange={(value) => setBaseColor(value)}
                  />
                </div>
                <div className="space-y-1">
                  <div className="text-[10px] uppercase text-muted-foreground">
                    Heading font
                  </div>
                  <Select
                    value={headingFont}
                    onValueChange={(v) => setHeadingFont(v as string)}
                  >
                    <Select.Trigger className="w-full">
                      <Select.Value placeholder="Please select a font" />
                    </Select.Trigger>
                    <Select.Content>
                      {['Inter', 'Roboto', 'Arial', 'System'].map((f) => (
                        <Select.Item key={f} value={f}>
                          {f}
                        </Select.Item>
                      ))}
                    </Select.Content>
                  </Select>
                </div>
                <div className="space-y-1">
                  <div className="text-[10px] uppercase text-muted-foreground">
                    Heading Color
                  </div>
                  <ColorPicker
                    value={headingColor}
                    onValueChange={(value) => setHeadingColor(value)}
                  />
                </div>
                <div className="space-y-1">
                  <div className="text-[10px] uppercase text-muted-foreground">
                    Link text
                  </div>
                  <ColorPicker
                    value={linkTextColor}
                    onValueChange={(value) => setLinkTextColor(value)}
                  />
                </div>
                <div className="space-y-1">
                  <div className="text-[10px] uppercase text-muted-foreground">
                    Link hover text
                  </div>
                  <ColorPicker
                    value={linkHoverTextColor}
                    onValueChange={(value) => setLinkHoverTextColor(value)}
                  />
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="text-sm font-semibold text-primary">
                Form elements color
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-1">
                  <div className="text-[10px] uppercase text-muted-foreground">
                    Primary action button
                  </div>
                  <ColorPicker
                    value={primaryBtnColor}
                    onValueChange={(value) => setPrimaryBtnColor(value)}
                  />
                </div>
                <div className="space-y-1">
                  <div className="text-[10px] uppercase text-muted-foreground">
                    Secondary action button
                  </div>
                  <ColorPicker
                    value={secondaryBtnColor}
                    onValueChange={(value) => setSecondaryBtnColor(value)}
                  />
                </div>
                <div className="space-y-1">
                  <div className="text-[10px] uppercase text-muted-foreground">
                    Heading divider & Input focus glow
                  </div>
                  <ColorPicker
                    value={dividerGlowColor}
                    onValueChange={(value) => setDividerGlowColor(value)}
                  />
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="text-sm font-semibold text-primary">Advanced</div>
              <div className="space-y-2">
                <div className="text-[10px] uppercase text-muted-foreground">
                  Header HTML
                </div>
                <Editor
                  className="h-48 min-h-48"
                  initialContent={convertHTMLToBlocks(headerHtml)}
                  onChange={handleHeaderEditorChange}
                />
              </div>
              <div className="space-y-2">
                <div className="text-[10px] uppercase text-muted-foreground">
                  Footer HTML
                </div>
                <Editor
                  className="h-48 min-h-48"
                  initialContent={convertHTMLToBlocks(footerHtml)}
                  onChange={handleFooterEditorChange}
                />
              </div>
            </div>
          </div>
        </Tabs.Content>
        <Tabs.Content value="auth" className="pt-4 pb-24 overflow-visible">
          <div className="px-2 space-y-4">
            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() =>
                  setAuthSectionsOpen([
                    'user-auth',
                    'test-user',
                    'otp',
                    'two-fa',
                    'confirm-mail',
                    'password',
                    'manual-verification',
                    'google-creds',
                    'facebook-creds',
                    'erxes-token',
                    'socialpay',
                    'toki',
                  ])
                }
              >
                Expand all
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setAuthSectionsOpen([])}
              >
                Collapse all
              </Button>
            </div>

            <Accordion
              type="multiple"
              value={authSectionsOpen}
              onValueChange={setAuthSectionsOpen}
              className="space-y-2"
            >
              <Accordion.Item value="user-auth">
                <Accordion.Trigger>User Authentication</Accordion.Trigger>
                <Accordion.Content>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-1">
                      <Label>Token pass method</Label>
                      <Select
                        value={tokenPassMethod}
                        onValueChange={(v) =>
                          setTokenPassMethod(v as 'cookie' | 'bearer')
                        }
                      >
                        <Select.Trigger className="w-full">
                          <Select.Value />
                        </Select.Trigger>
                        <Select.Content>
                          <Select.Item value="cookie">Cookie</Select.Item>
                          <Select.Item value="bearer">Bearer</Select.Item>
                        </Select.Content>
                      </Select>
                    </div>
                    <div className="space-y-1">
                      <Label>Token expiration duration (days)</Label>
                      <Input
                        type="number"
                        value={tokenExpireAfterDays as any}
                        onChange={(e) =>
                          setTokenExpireAfterDays(
                            e.target.value === '' ? '' : Number(e.target.value),
                          )
                        }
                      />
                    </div>
                    <div className="space-y-1">
                      <Label>Refresh token expiration duration (days)</Label>
                      <Input
                        type="number"
                        value={refreshTokenExpireAfterDays as any}
                        onChange={(e) =>
                          setRefreshTokenExpireAfterDays(
                            e.target.value === '' ? '' : Number(e.target.value),
                          )
                        }
                      />
                    </div>
                  </div>
                </Accordion.Content>
              </Accordion.Item>

              <Accordion.Item value="test-user">
                <Accordion.Trigger>Test user settings</Accordion.Trigger>
                <Accordion.Content>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <Label>Test user email</Label>
                      <Input
                        value={testUserEmail}
                        onChange={(e) => setTestUserEmail(e.target.value)}
                      />
                    </div>
                    <div className="space-y-1">
                      <Label>Test user phone</Label>
                      <Input
                        value={testUserPhone}
                        onChange={(e) => setTestUserPhone(e.target.value)}
                      />
                    </div>
                    <div className="space-y-1">
                      <Label>Test user password</Label>
                      <Input
                        type="password"
                        value={testUserPassword}
                        onChange={(e) => setTestUserPassword(e.target.value)}
                      />
                    </div>
                    <div className="space-y-1">
                      <Label>Test user OTP</Label>
                      <Input
                        value={testUserOtp}
                        onChange={(e) => setTestUserOtp(e.target.value)}
                      />
                    </div>
                  </div>
                </Accordion.Content>
              </Accordion.Item>

              <Accordion.Item value="otp">
                <Accordion.Trigger>OTP</Accordion.Trigger>
                <Accordion.Content>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-1">
                      <Label>Enable OTP Config</Label>
                      <Switch
                        checked={otpEnable}
                        onCheckedChange={setOtpEnable}
                      />
                    </div>
                    {otpEnable && (
                      <>
                        <div className="space-y-1 md:col-span-3">
                          <Label>Email subject</Label>
                          <Input
                            value={otpEmailSubject}
                            onChange={(e) => setOtpEmailSubject(e.target.value)}
                          />
                        </div>
                        <div className="space-y-1 md:col-span-3">
                          <Label>SMS transporter</Label>
                          <Input
                            value={otpSmsTransporterType}
                            onChange={(e) =>
                              setOtpSmsTransporterType(e.target.value)
                            }
                          />
                        </div>
                        <div className="space-y-1 md:col-span-3">
                          <Label>Content</Label>
                          <Editor
                            className="h-40 min-h-40"
                            initialContent={convertHTMLToBlocks(otpContent)}
                            onChange={(v) =>
                              handleRichTextChange(v, setOtpContent)
                            }
                          />
                        </div>
                        <div className="space-y-1">
                          <Label>Code length</Label>
                          <Input
                            type="number"
                            min={4}
                            value={otpCodeLength as any}
                            onChange={(e) =>
                              setOtpCodeLength(
                                e.target.value === ''
                                  ? ''
                                  : Number(e.target.value),
                              )
                            }
                          />
                        </div>
                        <div className="space-y-1">
                          <Label>Expire after (min)</Label>
                          <Input
                            type="number"
                            value={otpExpireAfter as any}
                            onChange={(e) =>
                              setOtpExpireAfter(
                                e.target.value === ''
                                  ? ''
                                  : Number(e.target.value),
                              )
                            }
                          />
                        </div>
                        <div className="space-y-1">
                          <Label>Login with OTP</Label>
                          <Switch
                            checked={otpLoginWithOTP}
                            onCheckedChange={setOtpLoginWithOTP}
                          />
                        </div>
                      </>
                    )}
                  </div>
                </Accordion.Content>
              </Accordion.Item>

              <Accordion.Item value="two-fa">
                <Accordion.Trigger>2 Factor Authentication</Accordion.Trigger>
                <Accordion.Content>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-1">
                      <Label>Enable 2FA</Label>
                      <Switch
                        checked={twoFactorEnable}
                        onCheckedChange={setTwoFactorEnable}
                      />
                    </div>
                    {twoFactorEnable && (
                      <>
                        <div className="space-y-1 md:col-span-3">
                          <Label>Email subject</Label>
                          <Input
                            value={twoFactorEmailSubject}
                            onChange={(e) =>
                              setTwoFactorEmailSubject(e.target.value)
                            }
                          />
                        </div>
                        <div className="space-y-1 md:col-span-3">
                          <Label>SMS transporter</Label>
                          <Input
                            value={twoFactorSmsTransporterType}
                            onChange={(e) =>
                              setTwoFactorSmsTransporterType(e.target.value)
                            }
                          />
                        </div>
                        <div className="space-y-1 md:col-span-3">
                          <Label>Content</Label>
                          <Editor
                            className="h-40 min-h-40"
                            initialContent={convertHTMLToBlocks(
                              twoFactorContent,
                            )}
                            onChange={(v) =>
                              handleRichTextChange(v, setTwoFactorContent)
                            }
                          />
                        </div>
                        <div className="space-y-1">
                          <Label>Code length</Label>
                          <Input
                            type="number"
                            min={4}
                            value={twoFactorCodeLength as any}
                            onChange={(e) =>
                              setTwoFactorCodeLength(
                                e.target.value === ''
                                  ? ''
                                  : Number(e.target.value),
                              )
                            }
                          />
                        </div>
                        <div className="space-y-1">
                          <Label>Expire after (min)</Label>
                          <Input
                            type="number"
                            value={twoFactorExpireAfter as any}
                            onChange={(e) =>
                              setTwoFactorExpireAfter(
                                e.target.value === ''
                                  ? ''
                                  : Number(e.target.value),
                              )
                            }
                          />
                        </div>
                      </>
                    )}
                  </div>
                </Accordion.Content>
              </Accordion.Item>

              <Accordion.Item value="confirm-mail">
                <Accordion.Trigger>
                  Confirmation mail settings
                </Accordion.Trigger>
                <Accordion.Content>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-1">
                      <Label>Enable mail config</Label>
                      <Switch
                        checked={mailEnable}
                        onCheckedChange={setMailEnable}
                      />
                    </div>
                    {mailEnable && (
                      <>
                        <div className="space-y-1 md:col-span-3">
                          <Label>Mail subject</Label>
                          <Input
                            value={mailSubject}
                            onChange={(e) => setMailSubject(e.target.value)}
                          />
                        </div>
                        <div className="space-y-1 md:col-span-3">
                          <Label>Invitation content</Label>
                          <Editor
                            className="h-48 min-h-48"
                            initialContent={convertHTMLToBlocks(
                              mailInvitationContent,
                            )}
                            onChange={(v) =>
                              handleRichTextChange(v, setMailInvitationContent)
                            }
                          />
                        </div>
                        <div className="space-y-1 md:col-span-3">
                          <Label>Registration content</Label>
                          <Editor
                            className="h-48 min-h-48"
                            initialContent={convertHTMLToBlocks(
                              mailRegistrationContent,
                            )}
                            onChange={(v) =>
                              handleRichTextChange(
                                v,
                                setMailRegistrationContent,
                              )
                            }
                          />
                        </div>
                      </>
                    )}
                  </div>
                </Accordion.Content>
              </Accordion.Item>

              <Accordion.Item value="password">
                <Accordion.Trigger>Password settings</Accordion.Trigger>
                <Accordion.Content>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-1">
                      <Label>Use code (OTP) instead of link</Label>
                      <Switch
                        checked={passwordVerifyByOTP}
                        onCheckedChange={setPasswordVerifyByOTP}
                      />
                    </div>
                    <div className="space-y-1 md:col-span-3">
                      <Label>SMS content</Label>
                      <Textarea
                        rows={3}
                        value={passwordSmsContent}
                        onChange={(e) => setPasswordSmsContent(e.target.value)}
                      />
                    </div>
                    <div className="space-y-1 md:col-span-3">
                      <Label>Subject</Label>
                      <Input
                        value={passwordEmailSubject}
                        onChange={(e) =>
                          setPasswordEmailSubject(e.target.value)
                        }
                      />
                    </div>
                    <div className="space-y-1 md:col-span-3">
                      <Label>Mail content</Label>
                      <Editor
                        className="h-48 min-h-48"
                        initialContent={convertHTMLToBlocks(
                          passwordEmailContent,
                        )}
                        onChange={(v) =>
                          handleRichTextChange(v, setPasswordEmailContent)
                        }
                      />
                    </div>
                  </div>
                </Accordion.Content>
              </Accordion.Item>

              <Accordion.Item value="manual-verification">
                <Accordion.Trigger>Manual verification</Accordion.Trigger>
                <Accordion.Content>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <Label>Enable manual verification</Label>
                      <Switch
                        checked={manualEnable}
                        onCheckedChange={setManualEnable}
                      />
                    </div>
                    {manualEnable && (
                      <>
                        <div className="space-y-1">
                          <Label>Verify customer</Label>
                          <Switch
                            checked={verifyCustomer}
                            onCheckedChange={setVerifyCustomer}
                          />
                        </div>
                        <div className="space-y-1">
                          <Label>Verify company</Label>
                          <Switch
                            checked={verifyCompany}
                            onCheckedChange={setVerifyCompany}
                          />
                        </div>
                      </>
                    )}
                  </div>
                </Accordion.Content>
              </Accordion.Item>

              <Accordion.Item value="google-creds">
                <Accordion.Trigger>
                  Google Application Credentials
                </Accordion.Trigger>
                <Accordion.Content>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-1 md:col-span-3">
                      <Label>Google Application Credentials</Label>
                      <Input disabled placeholder="Not used directly" />
                    </div>
                    <div className="space-y-1">
                      <Label>Google Client ID</Label>
                      <Input
                        value={googleClientId}
                        onChange={(e) => setGoogleClientId(e.target.value)}
                      />
                    </div>
                    <div className="space-y-1">
                      <Label>Google Client Secret</Label>
                      <Input
                        value={googleClientSecret}
                        onChange={(e) => setGoogleClientSecret(e.target.value)}
                      />
                    </div>
                    <div className="space-y-1">
                      <Label>Google Client Redirect URI</Label>
                      <Input
                        value={googleRedirectUri}
                        onChange={(e) => setGoogleRedirectUri(e.target.value)}
                      />
                    </div>
                  </div>
                </Accordion.Content>
              </Accordion.Item>

              <Accordion.Item value="facebook-creds">
                <Accordion.Trigger>
                  Facebook Application Credentials
                </Accordion.Trigger>
                <Accordion.Content>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-1 md:col-span-3">
                      <Label>Facebook App ID</Label>
                      <Input
                        value={facebookAppId}
                        onChange={(e) => setFacebookAppId(e.target.value)}
                      />
                    </div>
                  </div>
                </Accordion.Content>
              </Accordion.Item>

              <Accordion.Item value="erxes-token">
                <Accordion.Trigger>Erxes App Token</Accordion.Trigger>
                <Accordion.Content>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-1 md:col-span-3">
                      <Label>App Token</Label>
                      <Input
                        value={erxesAppToken}
                        onChange={(e) => setErxesAppToken(e.target.value)}
                      />
                    </div>
                  </div>
                </Accordion.Content>
              </Accordion.Item>

              <Accordion.Item value="socialpay">
                <Accordion.Trigger>SocialPay Config</Accordion.Trigger>
                <Accordion.Content>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <Label>Certificate ID</Label>
                      <Input
                        value={socialpayCertId}
                        onChange={(e) => setSocialpayCertId(e.target.value)}
                      />
                    </div>
                    <div className="space-y-1">
                      <Label>Public Key</Label>
                      <Input
                        value={socialpayPublicKey}
                        onChange={(e) => setSocialpayPublicKey(e.target.value)}
                      />
                    </div>
                  </div>
                </Accordion.Content>
              </Accordion.Item>

              <Accordion.Item value="toki">
                <Accordion.Trigger>Toki Config</Accordion.Trigger>
                <Accordion.Content>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <Label>API Key</Label>
                      <Input
                        value={tokiApiKey}
                        onChange={(e) => setTokiApiKey(e.target.value)}
                      />
                    </div>
                    <div className="space-y-1">
                      <Label>Merchant ID</Label>
                      <Input
                        value={tokiMerchantId}
                        onChange={(e) => setTokiMerchantId(e.target.value)}
                      />
                    </div>
                    <div className="space-y-1">
                      <Label>Username</Label>
                      <Input
                        value={tokiUsername}
                        onChange={(e) => setTokiUsername(e.target.value)}
                      />
                    </div>
                    <div className="space-y-1">
                      <Label>Password</Label>
                      <Input
                        type="password"
                        value={tokiPassword}
                        onChange={(e) => setTokiPassword(e.target.value)}
                      />
                    </div>
                    <div className="space-y-1">
                      <Label>Production</Label>
                      <Switch
                        checked={tokiProduction}
                        onCheckedChange={setTokiProduction}
                      />
                    </div>
                  </div>
                </Accordion.Content>
              </Accordion.Item>
            </Accordion>
          </div>
        </Tabs.Content>
        <Tabs.Content value="env" className="pt-4 pb-24">
          <div className="px-2 space-y-4">
            <div className="grid grid-cols-1 gap-2">
              {envVars.map((row) => (
                <div
                  key={row.id}
                  className="grid grid-cols-1 md:grid-cols-[1fr_1fr_auto_auto] items-center gap-2 border rounded px-2 py-2"
                >
                  <div className="space-y-1">
                    <Label>Key</Label>
                    <Input
                      value={row.key}
                      onChange={(e) =>
                        updateEnvVar(row.id, { key: e.target.value })
                      }
                      placeholder="KEY_NAME"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label>Value</Label>
                    <Input
                      type={row.hidden ? 'password' : 'text'}
                      value={row.value}
                      onChange={(e) =>
                        updateEnvVar(row.id, { value: e.target.value })
                      }
                      placeholder="Value"
                    />
                  </div>
                  <div className="flex gap-2 mt-4">
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={() =>
                        updateEnvVar(row.id, { hidden: !row.hidden })
                      }
                      className="justify-center"
                    >
                      {row.hidden ? <IconEye /> : <IconEyeOff />}
                    </Button>
                    <Button
                      type="button"
                      variant="destructive"
                      onClick={() => removeEnvVar(row.id)}
                      className="justify-center"
                    >
                      <IconTrash />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
            <div>
              <Button
                type="button"
                variant="outline"
                onClick={addEnvVar}
                className="gap-1"
              >
                <IconPlus /> Add new
              </Button>
            </div>
          </div>
        </Tabs.Content>
      </Tabs>
    </form>
  );
}
