const messageOf = (caught: unknown): string => {
  if (caught && typeof caught === 'object' && 'errors' in caught) {
    const { errors } = caught as { errors?: { message?: string }[] };
    const first = errors?.[0]?.message;

    if (first) {
      return first;
    }
  }

  return caught instanceof Error ? caught.message : '';
};

export const authErrorMessage = (caught: unknown): string => {
  const raw = messageOf(caught);

  if (/invalid login/i.test(raw)) {
    return 'Имэйл эсвэл нууц үг буруу байна.';
  }

  if (/not verified|verify your account/i.test(raw)) {
    return 'Бүртгэл баталгаажаагүй байна. Имэйлээ шалгаж баталгаажуулна уу.';
  }

  if (/locked/i.test(raw)) {
    return 'Бүртгэл түр хаагдсан байна. Хэсэг хугацааны дараа дахин оролдоно уу.';
  }

  if (/duplicated|already exist|duplicate/i.test(raw)) {
    return 'Энэ имэйлээр бүртгэл аль хэдийн үүссэн байна.';
  }

  if (/at least one number/i.test(raw)) {
    return 'Нууц үг том, жижиг үсэг, тоо агуулсан 8-аас доошгүй тэмдэгт байх ёстой.';
  }

  return raw || 'Алдаа гарлаа. Дахин оролдоно уу.';
};
