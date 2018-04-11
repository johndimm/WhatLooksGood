def get_fields(line):
    fields = line.rstrip().split("\t")
    id = ''
    if len(fields) > 0:
      id = fields[0]

    business_id = ''
    if len(fields) > 1:
      business_id = fields[1]

    caption = ''
    if len(fields) > 2:
      caption = fields[2]

    return (id, business_id, caption)
